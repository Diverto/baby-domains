docker build -t tandrosdiv/baby-api:latest -t tandrosdiv/baby-api:$SHA -f ./server/Dockerfile ./server
docker build -t tandrosdiv/baby-crawler:latest -t tandrosdiv/baby-crawler:$SHA -f ./crawler/Dockerfile ./crawler
# push to Docker Hub
docker push tandrosdiv/baby-api:latest
docker push tandrosdiv/baby-crawler:latest
docker push tandrosdiv/baby-api:$SHA
docker push tandrosdiv/baby-crawler:$SHA

kubectl apply -f k8s

kubectl set image deployments/server-deployment server=tandrosdiv/baby-api:$SHA
kubectl set image deployments/crawler-deployment crawler=tandrosdiv/baby-crawler:$SHA