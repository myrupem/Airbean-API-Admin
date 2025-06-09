### Inlogg
- api/auth/login
  Body request:
  ```
  {
  "username" : "jespernyberg",
  "password" : "jespernyberg"
  }

## Guest
### Continue as guest
- Samma endpoint som /login 
- Body request:
  ```
  {
   "continueAsGuest": true
  }

## Promotions
### GET
- /api/promotions
### POST
- /api/promotions

  Body request:
  ```
  {
	"title": "Cortado + Cappuccino 25% OFF",
	"description": "Obtain 25% discount when buying Cortado + Cappuccino",
	"requiredItems": [
				{
					"productId": "prod-ebest",
					"quantity": 1
				},
				{
					"productId": "prod-rgist",
					"quantity": 1
				}
			],
			"discountType": "percentage",
			"discountValue": 25,
			"isActive": true
  }
