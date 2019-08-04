/**
* Outputs `Hello, World!` when running `truffle run hello`,
* or `Hello, ${name}` when running `truffle run hello [name]`
* @param {Config} config - A truffle-config object.
* Has attributes like `truffle_directory`, `working_directory`, etc.
*/
var fs = require('fs');
var execSync = require('child_process').execSync;
module.exports = async (config) => {
    // config._ has the command arguments.
    // config_[0] is the command name, e.g. "hello" here.
    // config_[1] starts remaining parameters.
    if (config.help) {
        console.log(`Usage: truffle run hello [name]`);
        done(null, [], []);
        return;
    }

    let name = config._.length > 1 ? config._[1] : 'World!';
    // console.log(config['test_directory']);
    // console.log(config['contracts_build_directory']);
    // console.log(config._);
    test_case = config._[1];
    ltl_property = config._[2];
    console.log('test file    : ' + test_case);
    console.log('ltl property : ' + ltl_property);
    json_test = JSON.parse(fs.readFileSync(config['contracts_build_directory'] + '/' + test_case + '.json'));
    byte_code = json_test['deployedBytecode'];
    console.log('byte code    : ' + byte_code);
    byte_code_parsed = '#dasmOpCodes(#parseByteStack("' + byte_code + '"), BYZANTIUM)'
    kevm_test_case = [ 'load { "gas"  : 1000000'
                     , '     , "code" : ' + byte_code_parsed
                     , '     }'
                     , ''
                     , 'start'
                     , ''
                     ];
    kevm_test_case_str = kevm_test_case.join('\n');
    console.log('kevm test case : ' + kevm_test_case_str);
    fs.writeFileSync('../tmp.evm', kevm_test_case_str);
    // setTimeout(function() { console.log('here'); }, 1000);
    console.log('Running KEVM');
    const out = execSync('./kevm ltl tmp.evm "' + ltl_property + '" --output json', { cwd: '/home/dev/evm-semantics' , encoding: 'utf8' });
    // console.log(out);
    var jsonOut = JSON.parse(out);
    var formulaOut = jsonOut['term']['args'][0]['args'][1]['args'][0];
    var traceOut   = jsonOut['term']['args'][0]['args'][1]['args'][3];
    if (formulaOut['args'][0]['label'] == 'True_LTL_') {
        console.log('No violations!');
    } else {
        console.log('Violation found!');
    }
    // console.log(json_config);
    // Object.keys(config)
    // [ '_deepCopy'
    // , '_values'
    // , 'truffle_directory'
    // , 'working_directory'
    // , 'network'
    // , 'networks'
    // , 'verboseRpc'
    // , 'build'
    // , 'resolver'
    // , 'artifactor'
    // , 'ethpm'
    // , 'logger'
    // , 'compilers'
    // , 'build_directory'
    // , 'contracts_directory'
    // , 'contracts_build_directory'
    // , 'migrations_directory'
    // , 'migrations_file_extension_regexp'
    // , 'test_directory'
    // , 'test_file_extension_regexp'
    // , 'example_project_directory'
    // , 'network_id'
    // , 'network_config'
    // , 'from'
    // , 'gas'
    // , 'gasPrice'
    // , 'provider'
    // , 'confirmations'
    // , 'production'
    // , 'timeoutBlocks'
    // , 'plugins'
    // , '_'
    // ]

}
