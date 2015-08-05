/***
 * overrides of virtual_environment.js
 *
 * This file is the place to set the configurations that will be used by all
 * layers in your virtual environment.
 */


var virtualEnvironment = {
};

/***
 * Your organization code. Camel case. eg: Mpl, Nava
 * @type {string}
 */
virtualEnvironment.organization = 'Mpl';

/***
 * The CFACTS application name for this virtual environment. For example
 * OC HPF ECWS ECWS-PET MPL SLS
 *
 * @type {string}
 */
virtualEnvironment.application = 'Coreci';


/***
 * Defines the environment name eg Test Development etc
 * @type {string}
 */
virtualEnvironment.environment = 'Test0';


/***
 * The region of this virtual environment in aws
 */
virtualEnvironment.region = 'us-west-2';


/***
 * The bucket to use to store this vpc configuration
 * @type {string}
 */
virtualEnvironment.bucket = 'mpl-vpc-sandbox';


/***
 * The region of this virtual environment in aws
 */
virtualEnvironment.cidr = '10.244.0.0/16';


/***
 * The CMS id of the creator of this environment. This is just a person who
 * should be asked if its ok to remove the environment if there are questions
 * about whether it is still in use.
 *
 * @type {string}
 */
virtualEnvironment.creator = 'KVJH adrian kierman';


/***
 * This should contain the name of the virtual environment. On AWS this is the
 * Virtual Private Cloud Name.
 *
 * For example mpl-vpc-core-test. mpl-sls-prod. mpl-sls-test.
 *
 * We typically use {org}-{app}-{env} for ease of searching.
 *
 * @type {string}
 */
virtualEnvironment.name =
  virtualEnvironment.organization +
  virtualEnvironment.application +
  virtualEnvironment.environment;


virtualEnvironment.fqdn = virtualEnvironment.name.toDash() + '.hcgov.internal';


virtualEnvironment.s3Url = 's3://' +
  virtualEnvironment.bucket + '/' +
  virtualEnvironment.name.toDash();


virtualEnvironment.configPath = virtualEnvironment.s3Url + '/config.yaml';


virtualEnvironment.configureLayers = function() {
  /***
   * A set of layers to use in the generation of a the template
   * You can pick the layers relevant to your application here
   */
  var layers = {
    /***
     * Custom Application server layer
     */
    'app':  rootRequire('./layers/app/api'),
    /***
     * RDS database layer
     */
    'data': rootRequire('./layers/rds/mysql/mysql'),
    /***
     * Jump Box for maintenance access
     */
    'jump': rootRequire('./layers/jump/jump'),
    /***
     * Network address translation
     */
    'nat':  rootRequire('./layers/nat/nat'),
    /***
     * Transport, subnets, peering and networking
     */
    'net':  rootRequire('./layers/net/net')
  };
  // Also set the role for the app layer in ci to be a server with deploy permissions
  layers.app.Resources.AppLaunchConfig.Properties.IamInstanceProfile='server-ci-with-deploy-permissions';
  return layers;
};

/**
 * Run the amazon machine image builder before we cloudform
 */
virtualEnvironment.preformScript =
  " cd amis ; " +
  " cp -r ${APP_BASE_DIR}/* build/eve/var/core/app ; " +
  " export PACKER_LOG=1 ; " +
  " export PATH=$PATH:/usr/local/packer/ ; " +
  " build-amis.py --region " + virtualEnvironment.region + " coreci --use-version core=aq.8.9 "

virtualEnvironment.preCheck = function() {
  if (!process.env['APP_BASE_DIR']){
    process.env['APP_BASE_DIR'] = process.cwd();
    console.log('Setting the app base dir to the current dir: ' + process.env['APP_BASE_DIR']);
    console.log('If you intended a different directory you might want to try:');
    console.log('export APP_BASE_DIR=`pwd`/../coreci');
  }
};

module.exports = virtualEnvironment;
