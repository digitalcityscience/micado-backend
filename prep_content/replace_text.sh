#!/bin/sh

cp /tmp/source/keycloak_realms.json /tmp/realms/

sed -i 's+PLACEHOLDER_PA+'"$PA_HOSTNAME"'+g' /tmp/realms/keycloak_realms.json
sed -i 's+PLACEHOLDER_NGO+'"$NGO_HOSTNAME"'+g' /tmp/realms/keycloak_realms.json
sed -i 's+PLACEHOLDER_MIGRANTS+'"$MIGRANTS_HOSTNAME"'+g' /tmp/realms/keycloak_realms.json

echo "done"