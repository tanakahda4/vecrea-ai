<!--
   Copyright 2026 UCP Authors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
-->

# Example Business Agent

Example agent implementing A2A Extension for UCP

### Pre-requisites:

1. Python 3.13
2. UV
3. Gemini API Key (The agent uses Gemini model to generate responses)
4. docker, docker compose

## Quick Start

### Install

1. Clone the Vecrea AI repository.
   `git clone https://github.com/dentsusoken/vecrea-ai`
2. `cd vecrea-ai/samples/ucp-a2a-gpay/business_agent`
3. Run `uv sync`
4. Update the env.example file with your Gemini API key and rename it to .env

### DynamoDB local Setting

1. install aws cli. refer to https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html
2. login aws cli. refer to https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-sign-in.html
3. docker-compose -d
```yaml
version: '3'
services:
  dynamodb-local:
    image: amazon/dynamodb-local
    ports:
      - "8000:8000"
    volumes:
      - "./data:/data"
    command: ["-jar", "DynamoDBLocal.jar", "-sharedDb", "-dbPath", "/data"]
  dynamodb-admin:
    image: aaronshaf/dynamodb-admin
    ports:
      - "8001:8001"
    environment:
      - DYNAMO_ENDPOINT=http://dynamodb-local:8000
```
4. create table. refer to this aws command.
```bash
aws dynamodb create-table \
  --table-name Products \
  --attribute-definitions AttributeName=productID,AttributeType=S \
  --key-schema AttributeName=productID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 \
  --region ap-northeast-1
```
5. install python libs
```bash
uv pip install boto3,
uv pip install "botocore[crt]"
```
6. insert initial datas. by execute load_products_to_dynamodb.py
```python
python load_products_to_dynamodb.py
loaded 6 items
```
7. confirm datas in dynamoDB local from admin console by browser.
```
http://localhost:8001/
```
### Run business agent

8. `uv run business_agent`
9. This starts the business agent on port 10999. You can verify by accessing
   the agent card at http://localhost:10999/.well-known/agent-card.json
10. The business agent's UCP Profile can be found at
   http://localhost:10999/.well-known/ucp
