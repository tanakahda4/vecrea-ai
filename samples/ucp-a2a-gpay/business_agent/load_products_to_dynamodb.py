import json
import os
import boto3
from dotenv import load_dotenv
from pathlib import Path

def main():
    dynamodb = boto3.resource(
        "dynamodb",
        region_name="ap-northeast-1",
        endpoint_url="http://localhost:8000",
    )
    table = dynamodb.Table("Products")

    json_path = os.path.join(
        os.path.dirname(__file__),
        "./src/business_agent/data/products.json",
    )
    with open(json_path, "r") as f:
        products = json.load(f)

    with table.batch_writer() as batch:
        for p in products:
            batch.put_item(Item=p)

    print(f"loaded {len(products)} items")

if __name__ == "__main__":
    main()