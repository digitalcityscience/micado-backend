#!/bin/sh

cp /tmp/source/keycloak_realms.json /tmp/realms/

sed -i 's+pa.micado-pilot.hamburg.de+'"$PA_HOSTNAME"'+g' /tmp/realms/keycloak_realms.json
sed -i 's+ngo.micado-pilot.hamburg.de+'"$NGO_HOSTNAME"'+g' /tmp/realms/keycloak_realms.json
sed -i 's+migrants.micado-pilot.hamburg.de+'"$MIGRANTS_HOSTNAME"'+g' /tmp/realms/keycloak_realms.json

echo "done"