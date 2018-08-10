# Ubuntu 18.04
# Build with: docker build -t ssh_daemon .
# Run with: docker run -d -P --name ssh-daemon
# When the container is up and running it can be accessed with: ssh root@localhost -p <mappedDockerPort>
# The local port the exposed port 22 gets mapped to can be found with:: docker port ssh-daemon 22
# @see https://docs.docker.com/engine/examples/running_ssh_service/

FROM alpine:3.7

RUN apk --update add -qq sed openssh-server git apache2
RUN mkdir /var/run/sshd
RUN echo 'root:git_sshd' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i '/^#.*PermitRootLogin yes/s/^#//' /etc/ssh/sshd_config

RUN /usr/bin/ssh-keygen -A

# Using the sshd daemon to spawn shells makes it complicated to pass environment variables to the user’s shell via the normal Docker mechanisms, as sshd scrubs the environment before it starts the shell.
# If you’re setting values in the Dockerfile using ENV, you need to push them to a shell initialization file like the /etc/profile
# EXAMPLE:
# ENV NOTVISIBLE "in users profile"
# RUN echo "export VISIBLE=now" >> /etc/profile

# If you need to passdocker run -e ENV=value values, you need to write a short script to do the same before you start sshd -D and then replace the CMD with that script

# docker-volume for git data
VOLUME /git

# ssh ports
EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]