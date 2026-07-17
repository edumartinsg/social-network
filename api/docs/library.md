app.ts — builds and configures the application
It assembles everything the application is: plugins, routes, middleware, error handling. But it does not start anything. It returns a fully configured Fastify instance ready to receive requests.
Think of it as building a car — engine, wheels, everything assembled. But the car is not running yet.

server.ts — starts the application
It takes the configured app and does one thing: starts it listening on a port. Handles the actual network binding and startup errors.
This is turning the key and driving the car.

Tests. app.inject() needs a configured app but must never start a real server on a real port. If building the app and starting the server were the same function, every test would try to bind to port 3000 and they would collide.