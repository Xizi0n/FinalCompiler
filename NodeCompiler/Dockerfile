FROM ubuntu:bionic

COPY index.js /opt
COPY package-lock.json /opt
COPY package.json /opt
WORKDIR /opt
RUN apt-get update

RUN apt-get install -y gcc
RUN apt-get install -y g++
RUN apt-get install -y python3

RUN apt-get install -y software-properties-common

RUN apt-get install -y curl
RUN apt-get install -y sudo
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash
RUN apt-get install -y nodejs

RUN add-apt-repository ppa:openjdk-r/ppa
RUN apt-get update
RUN apt-get install -y openjdk-8-jdk
RUN npm install