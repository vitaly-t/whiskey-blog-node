#whiskey-blog-node

##It Should:

###store content

- (postgres, again?)
- post/article
    - title (string)
    - date created (datetime)
    - publish date (datetime)
    - author (user)
    - summary (html)
    - body (html)
    - ? list image (image) - viz tbd
    - ? detail image (image) - viz tbd
    - related posts (posts)
    - related reviews (reviews)
- review
    - product name (string)
    - date created (datetime)
    - publish date (datetime)
    - author (user)
    - summary (html)
    - body (html)
    - ? list image (image) - viz tbd
    - ? detail image (image) - viz tbd
    - distiller (distillery)
    - bottler (distillery)
    - type (drink type)
    - proof (float)
    - retail price (float/currency)
    - age (float)
    - rarity (rarity)
    - mashbill description (string)
    - mashbill recipe (string)
    - related posts (posts)
    - related reviews (reviews)
    - rating (float) (not shown)
- drink type
    - type name (string)
    - type name, plural (string)
- rarity
    - display name (string)
    - filter name (string)
    - sort order (integer)
- distillery
    - name (string)
    - type (choice: distiller/bottler/ndp) (store as int?)
    - state (string)
    - city (string)
    - region (string)
    - location (latlong)
- user
    - name (string)
    - username (string)
    - password hash (string/hash)
    - posts written (posts)
    - reviews written (reviews)
    - permissions level (integer)
- page
    - title (string)
    - date created (datetime)
    - publish date (datetime)
    - author (user)
    - body (html)
    - ? detail image (image)
    - route

###display content

- view single post
    - title
    - publish date
    - body
    - related posts
        - title
    - related reviews
        - title
- list posts
    - sort by publish date
    - title
    - summary
    - image?
- view single review
    - name
    - distiller
        - name
    - bottler
        - name
    - type
        - type name
    - proof
    - msrp
    - age
    - rarity
        - display name
    - mashbill description
    - mashbill recipe
    - related posts
        - title
    - related reviews
        - title
- list reviews
    - user defined sorts available
        - rating
        - price
        - proof
        - age
    - user defined filters available
        - type
        - rarity
        - age
        - distilled in
        - proof
        - msrp
- list posts and reviews together
    - sort by publish date

###Offer an admin area

- authenticate allowed users
- manage content: posts, reviews, distilleries, drink types, pages
    - create new
    - edit existing (if not created by higher auth'd user)
    - delete (if not created by higher auth'd user)
- manage images
    - create new
    - edit existing
    - delete
    - get url
    - pick from authoring screen?
- manage users if auth level is high enough

###Offer an authoring interface

- write markdown content with preview
- preview page
- image picker
- related posts/reviews picker
- save as draft
- publish

###Be pretty

- visual design tbd

###Be searchable

- keyword search
    - posts
        - title
        - body
        - summary
    - reviews
        - title
        - body
        - summary
        - distiller
        - bottler
        - drink type


##Reference

- https://www.terlici.com/2014/08/25/best-practices-express-structure.html
