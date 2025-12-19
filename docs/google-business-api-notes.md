# Google Business Profile API - Reviews Integration

## API Endpoints

### List all reviews
```
GET https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews
```

### Get a specific review
```
GET https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
```

### Get reviews from multiple locations
```
POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations:batchGetReviews

{
  "locationNames": [string],
  "pageSize": number,
  "pageToken": string,
  "orderBy": string,
  "ignoreRatingOnlyReviews": boolean
}
```

### Reply to a review
```
PUT https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply

{
  "comment": "Thank you for visiting our business!"
}
```

### Delete a review reply
```
DELETE https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply
```

## Authentication
- Requires OAuth 2.0 credentials
- Need to register application first
- User has GOOGLE_BUSINESS_CLIENT_ID and GOOGLE_BUSINESS_CLIENT_SECRET configured

## Implementation Plan
1. Create OAuth2 flow for Google Business Profile
2. Get account ID and location ID for "Orbi City Sea view Aparthotel"
3. Fetch reviews using the list endpoint
4. Store reviews in database
5. Update frontend to display live data
