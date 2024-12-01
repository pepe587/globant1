# Step 1: Use a base image
FROM nginx:alpine

# Dowload apt
RUN apk update && apk add bash \
    && apk add openssl \
    && apk add openssh \
    && apk add openrc \
    && apk add vim \
    && apk add nodejs \
    && apk add npm

# Install dotenv
# COPY package*.json ./
# RUN npm cache clean --force
# RUN npm install dotenv

# Step 2: Set the working directory
WORKDIR /usr/share/nginx/html

# Step 3: Copy application files
COPY ./tools /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf


# Step 4: Expose port 80 to access the application
EXPOSE 80

# Step 5: Start Nginx
CMD ["nginx", "-g", "daemon off;"]
