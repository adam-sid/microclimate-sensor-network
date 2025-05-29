# inputless-data-collection

[Link to website](https://agriscanner.onrender.com/)
Important note: This is hosted on a free web hosting service. Therefore it can take up to a minute to spin up after clicking the link.

This repo will hold the source documents for a prototype **minimally intrusive data collection system**. This will form part of a dissertation for a Computer Science Master's degree at the University of Bristol.
## Current concept

A webapp hosted online that is accessible from any device. This would be the point where users can upload data on apples. There would be a handful of ways they could upload this information 
1) QR code that would essentially work to pre-populate the manual form below with key data (e.g. weight of apples available, time they would be available for collection etc).
2) Photo upload - users upload a photo that would then be processed server side using established machine learning* tools to determine a _estimated_ weight of apples. This would by far be the trickiest element.
3) Manual form - A form that would ask for basic details

This information would then be saved in a database that is accessible from authorised users.

## Technologies
- Server
	- Node.js and Express.js - for building backend server
	- TypeScript - generally considered better than writing in standard JavaScript as it is more strongly typed and therefore helpful for avoiding bugs.
	- Jest - modern testing framework that works with typescript
- Machine learning*
	- Python - used for image analysis
- Hosting
	- Currently using [render](https://render.com/) as it has a free tier
	- Downside is this does not run continuously so would need a paid option down the line (cost ~£5 p.m)

- **\*Further details on machine learning/camera estimation**

Very much in early stages of thinking about this but there are machine learning models for estimating numbers of apples (or any object) within an image. These include:

- YOLO models (these are pre-trained, unknown accuracy on piles of apples however)

- CNN models (this may need to be trained manually with fairly large data sets (300-500 images) so questionable viability.

Could attempt to integrate these into the backend using user photos

- Note that neither of these would work on pomace (since it is liquid), so would have to estimate based on a volume provided.
## Overall Objectives

- Allow producers to upload apple waste data by simply scanning a QR code or taking a picture with their phone and this is processed by machine learning.

- Avoid the need for usernames, passwords, or app downloads.

- Collect data passively or with minimal input for later analysis.