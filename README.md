# HW4
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/05cbd3e36dbaadfdaa8f#?env%5BCSCI3916_HW3%5D=W3sidmFsdWUiOiJKV1QgZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBaQ0k2SWpWak9HVTJNV013TnpsbU5EYzJNREF3TkRsak5qWTRZU0lzSW5WelpYSnVZVzFsSWpvaVVtOTBkR0Z5YlNJc0ltbGhkQ0k2TVRVMU5EWTFOall3TTMwLl9DNnpfTHNVbk9EN0JPeVRBYmxncFhiRVpUWWdELTFRNmNtUVpuUnNYS2MiLCJrZXkiOiJzaWduaW5fdG9rZW4iLCJlbmFibGVkIjp0cnVlfSx7InZhbHVlIjoiSldUIGV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNklqVmpPR1l4TmpNeE5HSTNNemRqTURBd05ESXpOemxqT1NJc0luVnpaWEp1WVcxbElqb2lSMjFoYmlJc0ltbGhkQ0k2TVRVMU1qZzRNVFV5T0gwLlVHZFBIbFg3RU9jNVJURnphbzY1eGgwcU1rbmw2dlg0MVNEMS03YlMtRTQiLCJrZXkiOiJ0b2tlbiIsImVuYWJsZWQiOnRydWV9LHsidmFsdWUiOiI1YzhkMjg0OThkNGI5ODQzNjBiY2RkYzkiLCJrZXkiOiJtb3ZpZV9pZCIsImVuYWJsZWQiOnRydWV9XQ==)
A good flow to test reviews is this order:
- POST signup (will fail if you do not change the username)
- POST signin
- POST movies (adds the movie Annihilation to the database)
- GET movie w reviews (gets the newly added movie Annihilation)
- POST review (posts a review to Annihilation, you can do this multiple times)
- GET movie w reviews (gets Annihilation and all of it's reviews attached)
- DELETE movie and reviews (deletes Annihilation and the views)
