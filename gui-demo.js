const {
  QMainWindow,
  QWidget,
  QLabel,
  QLineEdit,
  QTextEdit,
  QPushButton,
  QComboBox,
  QDateEdit,
  QGridLayout,
  QMessageBox
} = require('@nodegui/nodegui');

// Database connection (you need to install and import the sqlite3 module)
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('crm.db');

const win = new QMainWindow();
win.setWindowTitle('CRM Software');
win.resize(800, 600);

const centralWidget = new QWidget();
centralWidget.setObjectName('myroot');
const rootLayout = new QGridLayout();
centralWidget.setLayout(rootLayout);

const companyNameLabel = new QLabel();
companyNameLabel.setText('Company Name');
rootLayout.addWidget(companyNameLabel, 0, 0);

const companyNameInput = new QLineEdit();
rootLayout.addWidget(companyNameInput, 0, 1);

const roleIdLabel = new QLabel();
roleIdLabel.setText('Role');
rootLayout.addWidget(roleIdLabel, 1, 0);

const roleIdInput = new QComboBox();
// Populate the roles combo box
db.all('SELECT role_id, description FROM role', (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    roleIdInput.addItem(undefined, row.description, row.role_id);
  }
});
rootLayout.addWidget(roleIdInput, 1, 1);

const resumeLabel = new QLabel();
resumeLabel.setText('Resume');
rootLayout.addWidget(resumeLabel, 2, 0);

const resumeInput = new QTextEdit();
rootLayout.addWidget(resumeInput, 2, 1);

const coverLetterLabel = new QLabel();
coverLetterLabel.setText('Cover Letter');
rootLayout.addWidget(coverLetterLabel, 3, 0);

const coverLetterInput = new QTextEdit();
rootLayout.addWidget(coverLetterInput, 3, 1);

const dateSubmittedLabel = new QLabel();
dateSubmittedLabel.setText('Date Submitted');
rootLayout.addWidget(dateSubmittedLabel, 4, 0);

const dateSubmittedInput = new QDateEdit();
rootLayout.addWidget(dateSubmittedInput, 4, 1);

const submitButton = new QPushButton();
submitButton.setText('Submit Application');
submitButton.addEventListener('clicked', () => {
  // Save application to database
  const companyName = companyNameInput.text();
  const roleId = roleIdInput.currentData();
  const resume = resumeInput.toPlainText();
  const coverLetter = coverLetterInput.toPlainText();
  const dateSubmitted = dateSubmittedInput.date().toString();

  // First insert resume and cover letter, then application
  db.run('INSERT INTO resume (body, name) VALUES (?, ?)', [resume, 'Resume'], function(err) {
    if (err) {
      console.error(err);
      return;
    }
    const resumeId = this.lastID;
    db.run('INSERT INTO coverletter (body, name) VALUES (?, ?)', [coverLetter, 'Cover Letter'], function(err) {
      if (err) {
        console.error(err);
        return;
      }
      const coverLetterId = this.lastID;
      db.run('INSERT INTO application (coverletter_id, role_id, resume_id, date_submitted) VALUES (?, ?, ?, ?)', [coverLetterId, roleId, resumeId, dateSubmitted], (err) => {
        if (err) {
          console.error(err);
          return;
        }
        QMessageBox.information(undefined, 'Success', 'Application submitted successfully!');
      });
    });
  });
});
rootLayout.addWidget(submitButton, 5, 1);

win.setCentralWidget(centralWidget);
win.show();

(global as any).win = win;
