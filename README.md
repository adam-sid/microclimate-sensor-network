# microclimate-sensor-network

[Link to placeholder website](https://agriscanner.onrender.com/)

_Important note: This is hosted on a free web hosting service. Therefore it can
take up to a minute to spin up after clicking the link. **As of 17/06/25 no
useful information is held on the website.**_

This repo will hold the source documents for a prototype tool that will help
farmers monitor microclimates across their field in real time. The website will
include a dashboard displaying current climate data in different parts of a
farm. Possible features include:

1) Dashboard showing current climate data in at least 3 parts of a farm. Data
   would be taken from sensors placed in different locations and information
   would be sent via mobile data (minimum viable product).
2) A history feature to see previous climate data over different periods of time
3) Notification system or log to show discrepancies or dangerous climate
   aberrations (i.e. frost risk warnings). This could be customised by the
   farmer.
4) Interactive farm map - show a ground map of the farm with the locations of
   each sensor.
5) (**Hard**) Integration with forecasts to do predictions on future
   microclimate conditions.


## Software
- **Server/Backend** 
	- Node.js and Express.js - for building backend server 
	- TypeScript - generally considered better than writing in standard
	JavaScript as it is more strongly typed and therefore helpful for avoiding
	bugs. 
	- Jest - modern testing framework that works with typescript
- **Website/frontend** 
	- Typescript website to present dashboard data. Likely will use REACT framework
	- Graphing tools: Recharts or Chart.js to display data.
- **Database** 
	- Either relational (SQL) or not (MongoDB). Will decide later in the project.
	- Used to store historical climate data.
- **Hosting**
	- Currently using [render](https://render.com/) as it has a free
	tier - Downside is this does not run continuously so would need a paid
	option down the line (cost ~£5 p.m).
	- May look at other hosting options.

## Hardware 
- **ESP32 microcontroller**
	- From [wikipedia](https://en.wikipedia.org/wiki/ESP32):

	_ESP32 is a family of low-cost, energy-efficient microcontrollers that
	integrate both Wi-Fi and Bluetooth capabilities._

	- [They are exceedingly cheap costing ~£2-4 per unit](https://www.aliexpress.com/item/1005006825727330.html?spm=a2g0o.productlist.main.1.1fcc45879aikPb)
	and capable of relaying information over Wi-Fi and bluetooth
	- They can be hooked up to a variety of sensors including temperature, 
	humidity, soil moisture and wind speed. See section below.

	![Image of an ESP32 module](/images/esp32-module.jpg)

	- Alternative: Use an arduino (less powerful/modern and more expensive)

- **Mobile connectivity**
	- [Would use a GSM module such as a SIM800L](https://www.aliexpress.com/item/1005005687766384.html?spm=a2g0o.productlist.main.3.7bc1189aNFQ8Xq).
	- Again this is very cheap at ~£2-4 per unit
	- This can be connected to an ESP32 to give it mobile data.

	![Image of a SIM800L module](/images/sim800L.jpg)

	- Could then use a cheap prepaid sim. [There are many on amazon](https://www.amazon.co.uk/s?k=prepaid+sim+card&i=electronics&crid=1W5QIVJJYJI45&sprefix=prepaid+sim+car%2Celectronics%2C95&ref=nb_sb_noss_2)

	- Alternative would be to use a long range radio module but this is more complex

- **Sensors**
	- There are 100s of sensors that are compatible with an ESP32.
	- Here are some guides on using sensors that are useful for 

- **Power**
	- Battery packs and perhaps small solar modules.

### Rough hardware cost

 - 3 ESP32 sensors @ £4 p.u
 - 3 SIM 800L @ £3 p.u
 - 3 PAYG SIM cards @ £5 p.u
 - 3 Batteries @ £8 p.u
 - 12 sensors at ~£3 p.u 
 - Total cost: £96
 - Will ask TechHub what they have for me to use.

	








