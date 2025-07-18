kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/pgdata-pvc.yaml
kubectl apply -f kubernetes/db-deployment.yaml
kubectl apply -f kubernetes/db-service.yaml
kubectl apply -f kubernetes/web-deployment.yaml
kubectl apply -f kubernetes/web-service.yaml
kubectl apply -f kubernetes/ingress.yaml
