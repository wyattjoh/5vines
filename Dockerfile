FROM    centos:centos6

# Enable Extra Packages for Enterprise Linux (EPEL) for CentOS
RUN     yum install -y epel-release

# Install Node.js and npm
RUN     yum install -y nodejs npm

# Bundle app source
COPY . /src

# Install app dependencies
RUN cd /src; npm install --production

ENV PORT 5059

WORKDIR /src

EXPOSE  5059
CMD ["node", "./bin/www"]
