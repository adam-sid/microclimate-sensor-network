# microclimate-sensor-network

[Link to website](https://agriscanner.onrender.com/)

This repo holds the source documents for a prototype tool that will help
farmers monitor microclimates across their field in real time. The website will
include a dashboard displaying current climate data in different parts of a
farm. Future feature set will include:

1) Dashboard showing current climate data in 2 parts of a farm. Data
   would be taken from sensors placed in different locations and information
   would be sent via mobile data (minimum viable product).
2) A history feature to see previous climate data over different periods of time
3) Notification system or log to show discrepancies or dangerous climate
   aberrations (i.e. frost risk warnings). This could be customised by the
   farmer.
4) (**Hard**) Integration with forecasts to do predictions on future
   microclimate conditions.


## Software
- **Server/Backend** 
	- Node.js and Express.js - for building backend server and api integration with database
	- TypeScript - generally considered better than writing in standard
	JavaScript as it is more strongly typed and therefore helpful for avoiding
	bugs. 
	- Jest - modern testing framework that works with typescript
- **Website/frontend** 
	- Typescript website to present dashboard data. Using pico.css for styling
	- Graphing tools: apache e charts
- **Database** 
	- postgresql database hosted on render
	- Used to store historical climate data.
- **Hosting**
	- Using [render](https://render.com/) as easy and relatively low cost.
	- May look at other hosting options.








