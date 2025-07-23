# 

## Model
www.msaez.io/#/204953361/storming/44b921ad007ce1ee2625ab8dcc05f9a0

## Before Running Services
### Make sure there is a Kafka server running
```
cd kafka
docker-compose up
```
- Check the Kafka messages:
```
cd infra
docker-compose exec -it kafka /bin/bash
cd /bin
./kafka-console-consumer --bootstrap-server localhost:9092 --topic
```

## Run the backend micro-services
See the README.md files inside the each microservices directory:

- ai
- term
- user
- point


## Run API Gateway (Spring Gateway)
```
cd gateway
mvn spring-boot:run
```

## Test by API
- ai
```
 http :8088/ais id="id"termId="termId"termTile="termTile"termCategory="termCategory"termProductName="termProductName"termContent="termContent"termVersion="termVersion"termRequirement="termRequirement"termRisk="termRisk"
```
- term
```
 http :8088/terms id="id"userId="userId"title="title"category="category"productName="productName"content="content"requirement="requirement"version="version"memo="memo"origin="origin"createdAt="created_at"modifiedAt="modified_at"expiresAt="expires_at"risk="risk"feedback="feedback"client="client"userCompany="userCompany"langCode="langCode"
```
- user
```
 http :8088/users id="id"name="name"password="password"company="company"
```
- point
```
 http :8088/points id="id"amount="amount"userId="userId"
```


## Run the frontend
```
cd frontend
npm i
npm run serve
```

## Test by UI
Open a browser to localhost:8088

## Required Utilities

- httpie (alternative for curl / POSTMAN) and network utils
```
sudo apt-get update
sudo apt-get install net-tools
sudo apt install iputils-ping
pip install httpie
```

- kubernetes utilities (kubectl)
```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

- aws cli (aws)
```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

- eksctl 
```
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```
