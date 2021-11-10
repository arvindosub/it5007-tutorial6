Instructions to Run App:

(Assuming you are in the repo directory, ‘npm install’ is already done and 'mongo' succesfully opens mongo db.)

1.  open 'Main.js', replace IP address in ipAdd variable with your own
1.	run 'mongo waitlist scripts/init.mongo.js'		                        (initialise db)
2.	run 'nodemon -w server -e js, graphql server/server.js'			        (start backend server)
3.  in a separate terminal, run 'npm run android'                           (start android emulator)

Note: Arrival time is displayed in the default local time of the emulater, which is UTC. On users' phones, it will be their local time.
