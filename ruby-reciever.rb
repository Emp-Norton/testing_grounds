# require 'serialport'
# require 'open-uri'
# require 'nokogiri'
#
# # Set up the serial port
# sp = SerialPort.new('/dev/ttyUSB0', 115200, 8, 1, SerialPort::NONE)
#
# # Listen for incoming SMS
# while true do
#   message = sp.gets
#   if message.start_with?('+CMT:')
#     # Extract the URL from the SMS
#     url = message.split(',')[2].strip
#
#     # Open the webpage
#     doc = Nokogiri::HTML(open(url))
#
#     # Extract the text from the div with class "target"
#     target_text = doc.css('[data-anchor-id=     StoreCard]').text
#
#     # Print the extracted text
#     puts target_text
#   end
# end

require 'serialport'
require 'uri'
require 'net/http'
require 'nokogiri'

# Connect to the SIM800L module
serial_port = SerialPort.new('/dev/ttyUSB0', 9600, 8, 1, SerialPort::NONE)

loop do
  # Read incoming SMS
  message = ''
  while (line = serial_port.readline) != "\r\n"
    message += line
  end

  # Extract the URL from the SMS
  url = URI.extract(message).first

  if url
    # Make an HTTP request to the URL
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)

    # Parse the HTML and extract the text from the div with the class "target"
    doc = Nokogiri::HTML(response.body)
    target_text = doc.css('.target').text

    puts "Received SMS with URL: #{url}"
    puts "Text from target div: #{target_text}"
  else
    puts "No URL found in SMS"
  end
end