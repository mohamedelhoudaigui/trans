# mohamedelhoudaigui-trans/frontend/Dockerfile
# Axiom IV: Pragmatic Purity - Lean, Mean, Clean

# Use a lightweight Nginx image based on Alpine Linux
FROM nginx:1.25-alpine

# Optional: Add maintainer label
LABEL maintainer="PRAETORIAN_CHIMERA"

# Remove default Nginx welcome page and any existing content in the default serve directory
# This ensures a clean slate for our static files.
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration file from the build context (./frontend)
# to the appropriate location within the Nginx container.
COPY nginx.conf /etc/nginx/nginx.conf

# Copy all static content (HTML, CSS, JavaScript) from the 'html' subdirectory
# in the build context (./frontend/html/) to Nginx's default serving directory.
COPY html/ /usr/share/nginx/html/

# Expose port 80, which is the default port Nginx listens on.
# This doesn't publish the port to the host; that's done in docker-compose.yml.
EXPOSE 80

# Command to run Nginx in the foreground.
# 'daemon off;' is necessary for Nginx to run as the primary process in the container,
# preventing the container from exiting immediately.
CMD ["nginx", "-g", "daemon off;"]
