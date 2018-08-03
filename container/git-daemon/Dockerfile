# Ubuntu 18.04
# Build with: docker build -t git_daemon.
# Run with: docker run -d -P --name git-daemon git_daemon
# When the container is up and running it can be accessed with: ssh root@localhost -p <mappedDockerPort>
# The local port the exposed port 22 gets mapped to can be found with:: docker port git-daemon 22
# @see https://docs.docker.com/engine/examples/running_ssh_service/
# The Git protocol gets exposed on port 9418 and can be accessed via "git git://localhost/<repoName>
# To expose a repository via the Git protocol the following has to be done:
  # $ cd /path/to/project.git
  # $ touch git-daemon-export-ok

FROM ubuntu:18.04

ENV DEBIAN_FRONTEND noninteractive

# Install git
RUN apt-get update -qq
RUN apt-get install -qqy git apache2 gitweb openssh-server

#ADD git-daemon.sh /usr/bin/git-daemon.sh
#RUN chmod +x /usr/bin/git-daemon.sh
ADD git_support.conf /etc/apache2/sites-available/git_support.conf
RUN a2ensite git_support
RUN a2enmod cgi alias env
VOLUME /git

RUN mkdir /var/run/sshd
RUN echo 'root:git_sshd' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i '/^#.*PermitRootLogin yes/s/^#//' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

# Using the sshd daemon to spawn shells makes it complicated to pass environment variables to the user’s shell via the normal Docker mechanisms, as sshd scrubs the environment before it starts the shell.
# If you’re setting values in the Dockerfile using ENV, you need to push them to a shell initialization file like the /etc/profile
ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

# If you need to passdocker run -e ENV=value values, you need to write a short script to do the same before you start sshd -D and then replace the CMD with that script

# git daemon ports
EXPOSE 9418 22

CMD service apache2 start && /usr/sbin/sshd -D && git daemon --export-all --base-path=/git --listen=0.0.0.0 --port=9418
