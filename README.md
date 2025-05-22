# inputless-data-collection

This repo will hold the source documents for a prototype **minimally intrusive data collection system**. This will form part of a dissertation for a Computer Science Master's degree at the University of Bristol.

Potential technologies used include:

- **QR Code Generation**  
  QR codes could be pre-generated and printed for use at apple farms or production sites. Scanning a code will redirect the user to a web endpoint and the qr code would contain known data about the quantity of apples.

- **Frontend Web Interface**  
  A webpage will be served to users after scanning, prompting them to enter additional information such as the a quantity of apple waste available. This will be built using HTML/CSS/JavaScript (would use typescript). Also considering using a react framework.

- **Backend Data Logging**  
  Thinking of using Node.js as that is fairly modern and keeps the language the same as frontend so no issues with classes/types.

- **Database**  
  All events and form inputs will be recorded in a database (mongoDB or mySQL).

- **Hosting**  
  TBD

- **Machine learning/camera estimation**  
  Very much in early stages of thinking about this but there are machine learning models for estimating numbers of apples (or any object) within an image. These include:
  - YOLO models (these are pre-trained, unknown accuracy on piles of apples however)
  - CNN models (this may need to be trained manually with fairly large data sets (300-500 images) so questionable viability.
  
  Could attempt to integrate these into the backend using user photos
  - Note that neither of these would work on pomace (since it is liquid), so would have to estimate based on a volume provided.



## Objectives

- Allow producers to upload apple waste data by simply scanning a QR code or taking a picture with their phone and this is processed by machine learning.
- Avoid the need for usernames, passwords, or app downloads.
- Collect data passively or with minimal input for later analysis.
