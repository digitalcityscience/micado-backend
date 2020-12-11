// Uncomment these imports to begin using these cool features!
import { inject } from '@loopback/context';
import { get, post, param, del, patch, HttpErrors } from '@loopback/rest';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import { TenantRepository } from '../repositories';
import { Tenant } from '../models';
import {
  IdentityService,

} from '../services/identity.service'

// import {inject} from '@loopback/context';
var soap = require('soap');
var request = require('request')

var req = request.defaults({
  strictSSL: false
});

export class IdentityTenantManagerController {
  constructor(
    @repository(TenantRepository) public tenantRepository: TenantRepository,
    @inject('services.Identity') protected identityService: IdentityService,
  ) { }


  @get('/getTenant/{tenant}')
  async getTenant (
    @param.path.string('tenant') tenantDomain: String,
  ): Promise<any> {
    //Preconditions
    console.log("in the identity controller")
    console.log(tenantDomain)
    var innerPort = (process.env.MICADO_ENV != undefined && process.env.MICADO_ENV.localeCompare("dev") == 0 ? "" : ":9443")
    var url = 'https://' + process.env.IDENTITY_HOSTNAME + innerPort + '/services/TenantMgtAdminService?wsdl'
    var args = { tenantDomain: tenantDomain };
    var options = {
      request: req,
      wsdl_options: {
        forever: true,
        rejectUnauthorized: false,
        strictSSL: false
      },
      endpoint: 'https://' + process.env.IDENTITY_HOSTNAME + innerPort + '/services/TenantMgtAdminService.TenantMgtAdminServiceHttpsEndpoint/'
    }
    var tenantInfo = null
    return new Promise((resolve, reject) => {
      soap.createClient(url, options, function (err: any, client: any) {
        client.setSecurity(new soap.BasicAuthSecurity(process.env.WSO2_IDENTITY_ADMIN_USER, process.env.WSO2_IDENTITY_ADMIN_PWD));
        console.log(JSON.stringify(client.describe()))
        client.getTenant(args, function (err: any, result: any) {
          console.log(result);
          return resolve(result)
        });
      });
    })
  }

  @get('/getTenant')
  async retrieveTenants (
  ): Promise<any> {
    //Preconditions
    console.log("in the identity controller retrieveTenants")
    //    var url = '/code/micado-backend/src/datasources/TenantMgtAdminService.xml';

    var innerPort = (process.env.MICADO_ENV != undefined && process.env.MICADO_ENV.localeCompare("dev") == 0 ? "" : ":9443")
    console.log(process.env.MICADO_ENV)
    console.log(innerPort)
    var url = 'https://' + process.env.IDENTITY_HOSTNAME + innerPort + '/services/TenantMgtAdminService?wsdl'
    console.log(url)
    var args = {};
    var options = {
      request: req,
      wsdl_options: {
        forever: true,
        rejectUnauthorized: false,
        strictSSL: false
      },
      endpoint: 'https://' + process.env.IDENTITY_HOSTNAME + innerPort + '/services/TenantMgtAdminService.TenantMgtAdminServiceHttpsEndpoint/'
    }
    var tenantInfo = null
    return new Promise((resolve, reject) => {
      soap.createClient(url, options, function (err: any, client: any) {
        client.setSecurity(new soap.BasicAuthSecurity(process.env.WSO2_IDENTITY_ADMIN_USER, process.env.WSO2_IDENTITY_ADMIN_PWD));
        console.log(JSON.stringify(client.describe()))

        client.retrieveTenants(args, function (err: any, result: any) {
          //     client.getTenant(args, function (err: any, result: any) {
          console.log(result);
          return resolve(result)
        });
      });
    })
  }

  @post('/wso2Tenant')
  async addTenant (
    @param.query.string('tenant') tenantDomain: String,
    @param.query.string('password') password: String,
    @param.query.string('email') email: String,
    @param.query.string('firstname') firstname: String,
    @param.query.string('lastname') lastname: String,
  ): Promise<any> {
    //Preconditions
    console.log("in the identity controller")
    console.log(tenantDomain)
    var innerPort = (process.env.MICADO_ENV != undefined && process.env.MICADO_ENV.localeCompare("dev") == 0 ? "" : ":9443")
    var url = 'https://' + process.env.IDENTITY_HOSTNAME + innerPort + '/services/TenantMgtAdminService?wsdl'
    let tenants = await this.retrieveTenants()
    console.log(tenants)
    let maxTenant = tenants.retrieveTenantsResponse.return.sort(
      function (a: any, b: any) {
        return b['tenantId'] - a['tenantId'];
      }
    )[0]['tenantId']
    console.log(maxTenant)
    maxTenant++
    var args = {
      tenantInfoBean: {
        active: true,
        admin: "admin",
        adminPassword: password,
        createdDate: '',
        email: email,
        firstname: firstname,
        lastname: lastname,
        originatedService: '',
        successKey: '',
        tenantDomain: tenantDomain,
        tenantId: maxTenant,
        usagePlan: ''
      }
    };
    var options = {
      request: req,
      wsdl_options: {
        forever: true,
        rejectUnauthorized: false,
        strictSSL: false
      },
      endpoint: 'https://' + process.env.IDENTITY_HOSTNAME + innerPort + '/services/TenantMgtAdminService.TenantMgtAdminServiceHttpsEndpoint/'
    }
    var tenantInfo = null
    return new Promise((resolve, reject) => {
      soap.createClient(url, options, function (err: any, client: any) {
        client.setSecurity(new soap.BasicAuthSecurity(process.env.WSO2_IDENTITY_ADMIN_USER, process.env.WSO2_IDENTITY_ADMIN_PWD));
        console.log(JSON.stringify(client.describe()))
        client.addTenant(args, function (err: any, result: any) {
          console.log(result);
          console.log(err)
          result.tenantInfoBean = args.tenantInfoBean
          return resolve(result)
        });
      });
    })
  }

  @post('/wso2TenantPlusDB')
  async addTenantPlusDB (
    @param.query.string('tenant') tenantDomain: string,
    @param.query.string('password') password: string,
    @param.query.string('email') email: String,
    @param.query.string('firstname') firstname: String,
    @param.query.string('lastname') lastname: String,
    @param.query.string('tenantname') tenantname: string,
    @param.query.string('link') link: string,
    @param.query.string('address') address: string,
    @param.query.string('contactmail') contactmail: string,
  ): Promise<any> {

    let isRet = await this.addTenant(tenantDomain, password, email, firstname, lastname)
    console.log(isRet)
    // since we are adding the tenant we also need to add the roles that are needed
    // we only add NGO tenants so we need to use the admin and password we just created since that is the only one allowed to operate in the tenant
    let roleRet1 = await this.addRole("APPLICATION/micado_ngo_superadmin", tenantDomain, "admin", password)
    console.log(roleRet1)
    let roleRet2 = await this.addRole("APPLICATION/micado_ngo_migrant_manager", tenantDomain, "admin", password)
    console.log(roleRet2)
    let dbTenant: Tenant = new Tenant({
      id: isRet.tenantInfoBean.tenantId,
      name: tenantname,
      link: link,
      email: contactmail,
      address: address
    })
    return this.tenantRepository.create(dbTenant);
  }

  @del('/wso2Tenant')
  async delTenant (
    @param.query.string('tenant') tenantDomain: String,
  ): Promise<any> {
    //Preconditions
    console.log("in the identity controller")
    console.log(tenantDomain)
    var innerPort = (process.env.MICADO_ENV != undefined && process.env.MICADO_ENV.localeCompare("dev") == 0 ? "" : ":9443")
    var url = 'https://' + process.env.IDENTITY_HOSTNAME + innerPort + '/services/TenantMgtAdminService?wsdl'
    var args = {
      tenantDomain: tenantDomain
    }
    var options = {
      request: req,
      wsdl_options: {
        forever: true,
        rejectUnauthorized: false,
        strictSSL: false
      },
      endpoint: 'https://' + process.env.IDENTITY_HOSTNAME + innerPort + '/services/TenantMgtAdminService.TenantMgtAdminServiceHttpsEndpoint/'
    }
    var tenantInfo = null
    return new Promise((resolve, reject) => {
      soap.createClient(url, options, function (err: any, client: any) {
        client.setSecurity(new soap.BasicAuthSecurity(process.env.WSO2_IDENTITY_ADMIN_USER, process.env.WSO2_IDENTITY_ADMIN_PWD));
        console.log(JSON.stringify(client.describe()))
        client.deleteTenant(args, function (err: any, result: any) {
          console.log(result);
          console.log(err)
          //        result.tenantInfoBean = args.tenantInfoBean
          return resolve(result)
        });
      });
    })
  }

  @del('/wso2TenantPlusDB')
  async deleteTenantPlusDB (
    @param.query.string('tenant') tenantDomain: String,
    @param.query.number('id') id: number,
  ): Promise<any> {

    let isRet = await this.delTenant(tenantDomain)
    console.log(isRet)
    return this.tenantRepository.deleteById(id);
  }

  // Role/Groups management

  @post('/wso2Role')
  async addRole (
    @param.query.string('role') role: string,
    @param.query.string('tenant') tenant = 'super',
    @param.query.string('admin') admin = (process.env.WSO2_IDENTITY_ADMIN_USER != null ? process.env.WSO2_IDENTITY_ADMIN_USER : ''),
    @param.query.string('adminpwd') adminpwd = (process.env.WSO2_IDENTITY_ADMIN_PWD != null ? process.env.WSO2_IDENTITY_ADMIN_PWD : ''),
    @param.query.string('authType') authType = 'Basic',
    @param.query.string('authToken') authToken: string = ''
  ): Promise<any> {
    //This function can be called either passing the credentials of the admin of with the access token from a logged user
    // authType can be 'Bearer' or 'Basic' for authTocker or user:pwd hash
    console.log("in the identity controller")
    console.log(role)
    console.log(authType)

    let auth: String
    if (authType === 'Basic') {
      auth = this.calcAuth(admin, adminpwd)
    } else {
      auth = authToken
    }
    console.log(auth)
    var innerPort = (process.env.MICADO_ENV != undefined && process.env.MICADO_ENV.localeCompare("dev") == 0 ? "" : ":9443")

    //"YWRtaW5AbWlncmFudHMubWljYWRvLmV1Om1pY2Fkb2FkbTIwMjA="
    return this.identityService.addGroups(
      role,
      auth,
      process.env.IDENTITY_HOSTNAME + innerPort,
      tenant,
      authType
    );

  }

  @get('/wso2Role')
  async getGroup (
    @param.query.string('role') role: string,
    @param.query.string('tenant') tenant = 'super',
    @param.query.string('admin') admin = (process.env.WSO2_IDENTITY_ADMIN_USER != null ? process.env.WSO2_IDENTITY_ADMIN_USER : ''),
    @param.query.string('adminpwd') adminpwd = (process.env.WSO2_IDENTITY_ADMIN_PWD != null ? process.env.WSO2_IDENTITY_ADMIN_PWD : ''),
    @param.query.string('authType') authType = 'Basic',
    @param.query.string('authToken') authToken: string = ''
  ): Promise<any> {
    //This function can be called either passing the credentials of the admin of with the access token from a logged user
    // authType can be 'Bearer' or 'Basic' for authTocker or user:pwd hash
    console.log("in the identity controller getGroup")
    console.log(role)
    console.log(tenant)
    console.log(admin)
    console.log(adminpwd)
    console.log(authType)

    let auth: String
    if (authType === 'Basic') {
      auth = this.calcAuth(admin, adminpwd)
    } else {
      auth = authToken
    }
    console.log(auth)
    var innerPort = (process.env.MICADO_ENV != undefined && process.env.MICADO_ENV.localeCompare("dev") == 0 ? "" : ":9443")

    //"YWRtaW5AbWlncmFudHMubWljYWRvLmV1Om1pY2Fkb2FkbTIwMjA="
    return this.identityService.getGroup(
      role,
      auth,
      process.env.IDENTITY_HOSTNAME + innerPort,
      tenant,
      authType
    );

  }

  @patch('/wso2Role')
  async addToGroup (
    @param.query.string('groupid') groupid: string,
    @param.query.string('username') username: string,
    @param.query.string('userid') userid: string,
    @param.query.string('location') location: string,
    @param.query.string('tenant') tenant = 'super',
    @param.query.string('admin') admin = (process.env.WSO2_IDENTITY_ADMIN_USER != null ? process.env.WSO2_IDENTITY_ADMIN_USER : ''),
    @param.query.string('adminpwd') adminpwd = (process.env.WSO2_IDENTITY_ADMIN_PWD != null ? process.env.WSO2_IDENTITY_ADMIN_PWD : ''),
    @param.query.string('authType') authType = 'Basic',
    @param.query.string('authToken') authToken: string = ''
  ): Promise<any> {
    //This function can be called either passing the credentials of the admin of with the access token from a logged user
    // authType can be 'Bearer' or 'Basic' for authTocker or user:pwd hash
    console.log("in the identity controller getGroup")
    console.log(groupid)
    console.log(tenant)
    console.log(admin)
    console.log(adminpwd)
    console.log(authType)

    let auth: String
    if (authType === 'Basic') {
      auth = this.calcAuth(admin, adminpwd)
    } else {
      auth = authToken
    }
    console.log(auth)
    var innerPort = (process.env.MICADO_ENV != undefined && process.env.MICADO_ENV.localeCompare("dev") == 0 ? "" : ":9443")

    //"YWRtaW5AbWlncmFudHMubWljYWRvLmV1Om1pY2Fkb2FkbTIwMjA="
    return this.identityService.addToGroups(
      groupid,
      username,
      userid,
      location,
      auth,
      process.env.IDENTITY_HOSTNAME + innerPort,
      tenant,
      authType
    );

  }

  @post('/wso2User')
  async addUser (
    @param.query.string('username') username: string,
    @param.query.string('password') password: string,
    @param.query.string('name') name: string,
    @param.query.string('surname') surname: string,
    @param.query.string('email') email: string,
    @param.query.string('tenant') tenant = 'super',
    @param.query.string('admin') admin = (process.env.WSO2_IDENTITY_ADMIN_USER != null ? process.env.WSO2_IDENTITY_ADMIN_USER : ''),
    @param.query.string('adminpwd') adminpwd = (process.env.WSO2_IDENTITY_ADMIN_PWD != null ? process.env.WSO2_IDENTITY_ADMIN_PWD : ''),
    @param.query.string('authType') authType = 'Basic',
    @param.query.string('authToken') authToken: string = ''
  ): Promise<any> {
    //This function can be called either passing the credentials of the admin of with the access token from a logged user
    // authType can be 'Bearer' or 'Basic' for authTocker or user:pwd hash
    console.log("in the identity controller")
    console.log(username)
    console.log(authType)

    let auth: String
    if (authType === 'Basic') {
      auth = this.calcAuth(admin, adminpwd)
    } else {
      auth = authToken
    }
    console.log(auth)
    var innerPort = (process.env.MICADO_ENV != undefined && process.env.MICADO_ENV.localeCompare("dev") == 0 ? "" : ":9443")

    //"YWRtaW5AbWlncmFudHMubWljYWRvLmV1Om1pY2Fkb2FkbTIwMjA="
    return this.identityService.createUser(
      username,
      password,
      name,
      surname,
      email,
      auth,
      process.env.IDENTITY_HOSTNAME + innerPort,
      tenant,
      authType
    );

  }

  @post('/wso2UserComplete')
  async addUserComplete (
    @param.query.string('username') username: string,
    @param.query.string('password') password: string,
    @param.query.string('name') name: string,
    @param.query.string('surname') surname: string,
    @param.query.string('email') email: string,
    @param.query.string('roles') roles: string,
    @param.query.string('tenant') tenant = 'super',
    @param.query.string('admin') admin = (process.env.WSO2_IDENTITY_ADMIN_USER != null ? process.env.WSO2_IDENTITY_ADMIN_USER : ''),
    @param.query.string('adminpwd') adminpwd = (process.env.WSO2_IDENTITY_ADMIN_PWD != null ? process.env.WSO2_IDENTITY_ADMIN_PWD : ''),
    @param.query.string('authType') authType = 'Basic',
    @param.query.string('authToken') authToken: string = ''
  ): Promise<any> {
    //This function can be called either passing the credentials of the admin of with the access token from a logged user
    // authType can be 'Bearer' or 'Basic' for authTocker or user:pwd hash
    console.log("in the identity controller")
    let rolesArr = roles.split(',')
    console.log(rolesArr)
    console.log(authType)
    let possibleRoles: string[] = ['micado_ngo_migrant_manager', 'micado_ngo_superadmin']
    console.log(possibleRoles)
    let auth: String
    if (authType === 'Basic') {
      auth = this.calcAuth(admin, adminpwd)
    } else {
      auth = authToken
    }
    console.log(auth)
    // I need to create the user
    let userRet = await this.addUser(username, password, name, surname, email, tenant, admin, adminpwd, authType, authToken)
    console.log(userRet)
    // need to get useid and location
    rolesArr.forEach(element => {
      console.log(element)
      if (possibleRoles.includes(element)) {
        console.log("role included")
        // need to get the role
        this.getGroup(element, tenant, admin, adminpwd, authType, authToken)
          .then((theGroup) => {
            console.log(theGroup)
            if (theGroup.totalResults > 0) {
              console.log(theGroup.Resources[0].id)
              //         
              this.addToGroup(theGroup.Resources[0].id, username, userRet.id, userRet.meta.location, tenant, admin, adminpwd, authType, authToken)
            }
          })

      }
    });
    // I need to get the roles id for the requested roles
    return null
  }

  calcAuth (admin: string, adminpwd: String) {

    var b = Buffer.from(admin + ':' + adminpwd);
    // If we don't use toString(), JavaScript assumes we want to convert the object to utf8.
    // We can make it convert to other formats by passing the encoding type to toString().
    var s = b.toString('base64');
    return s
  }
}
