FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY aron.jpg /usr/share/nginx/html/
COPY aron.mp4 /usr/share/nginx/html/
COPY opengraph.png /usr/share/nginx/html/
COPY photos /usr/share/nginx/html/photos
COPY logos /usr/share/nginx/html/logos

# Expose port 80
EXPOSE 80

# nginx:alpine already has CMD to start nginx
