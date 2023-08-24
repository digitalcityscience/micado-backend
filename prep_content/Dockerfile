FROM alpine:3.14

COPY ./keycloak/realms/keycloak_realms_group_roles_clients.json /tmp/source/keycloak_realms.json

COPY ./prep_content/replace_text.sh /
RUN chmod +x /replace_text.sh
CMD ["bin/sh","replace_text.sh"]

