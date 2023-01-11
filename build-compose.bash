docker build -f Scooter.Dockerfile -t jolpango/scooter-simulation:$1 .
docker build -f User.Dockerfile -t jolpango/user-simulation:$1 .