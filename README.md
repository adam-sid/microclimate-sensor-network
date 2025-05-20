# inputless-qr-logger

This repo will hold the source documents for a prototype **minimally intrusive data collection system**. This will form part of a dissertation for a Computer Science Master's degree at the University of Bristol.

Potential technologies used include:

- **QR Code Generation**  
  QR codes will be pre-generated and printed for use at apple farms or production sites. Scanning a code will redirect the user to a web endpoint.

- **Frontend Web Interface**  
  A webpage will be served to users after scanning, prompting them to enter additional information such as the a quantity of apple waste available. This will be built using HTML/CSS/JavaScript (and potentially react).

- **Backend Data Logging**  
  A Python-based web server (considering Flask) will receive and log the QR scans and any form submissions.

- **Database**  
  All events and form inputs will be recorded in a database (mongoDB or mySQL).

- **Hosting**  
  TBD

## Objectives

- Allow producers to upload apple waste data by simply scanning a QR code.
- Avoid the need for usernames, passwords, or app downloads.
- Collect data passively or with minimal input for later analysis.