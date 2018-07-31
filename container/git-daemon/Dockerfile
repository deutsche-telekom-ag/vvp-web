# Ubuntu 18.04
# Build with: docker build -t git_daemon.
# Run with: docker run -d -P --name git-daemon git_daemon
# The Git protocol gets exposed on port 9418 and can be accessed via "git git://localhost/<repoName>
# To expose a repository via the Git protocol the following has to be done:
  # $ cd /path/to/project.git
  # $ touch git-daemon-export-ok

FROM ubuntu:18.04

ENV DEBIAN_FRONTEND noninteractive

# Install git
RUN apt-get update -qq

RUN apt-get install -qqy git

ADD git-daemon.sh /usr/bin/git-daemon.sh
RUN chmod +x /usr/bin/git-daemon.sh

# docker-volume for git-data
VOLUME /git

# git daemon ports
EXPOSE 9418

CMD /usr/bin/git-daemon.sh
