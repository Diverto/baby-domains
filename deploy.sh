docker build -t tandrosdiv/baby-api:latest -t tandrosdiv/baby-api:$SHA -f ./server/Dockerfile ./server
docker build -t tandrosdiv/baby-crawler:latest -t tandrosdiv/baby-crawler:$SHA -f ./crawler/Dockerfile ./crawler
docker build -t tandrosdiv/baby-api-creator:latest -t tandrosdiv/baby-api-creator:$SHA -f ./api-creator/Dockerfile ./api-creator

# push to Docker Hub #2
docker push tandrosdiv/baby-api:latest
docker push tandrosdiv/baby-crawler:latest
docker push tandrosdiv/baby-api-creator:latest
docker push tandrosdiv/baby-api:$SHA
docker push tandrosdiv/baby-crawler:$SHA
docker push tandrosdiv/baby-api-creator:$SHA

kubectl apply -f k8s

kubectl set image statefulset webserver webserver=tandrosdiv/baby-api:$SHA
kubectl set image deployments/crawler-deployment crawler=tandrosdiv/baby-crawler:$SHA
kubectl set image statefulset api-creator api-creator=tandrosdiv/baby-api-creator:$SHA