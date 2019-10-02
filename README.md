# pulse-tracker

Track the whereabouts of the latest Pulse Bus in Richmond

## Configuration

To run this application, you need to get an API key by making an account on [GRTC](http://new.grtcbustracker.com/bustime/home.jsp) and requesting for one under `My API`. Once you have it, add it to a `.env` file, something like:

`GRTC_KEY=<your key>`

## To Run Local Build

- `npm install`
- `npm start`

## Run Docker Build

- `npm run build`

## Testing

At the current state, the project only supports the Scott's Addition Eastbound and Westbound stops, which can be pinged using these URLs, respectively:

- localhost:\<port>/3504
- localhost:\<port>/3503
