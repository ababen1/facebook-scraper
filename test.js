const PythonShell = require('python-shell').PythonShell;
const { spawn } = require('child_process');
// let options = {
//     mode: 'text',
//     pythonOptions: ['-u'], // get print results in real-time
//     scriptPath: 'C:/Users/shaha/PycharmProjects/whatsappSendMessageToEnterGroup',
//     args: ['"Hey from NodeJs"']
//   };
// PythonShell.runString('x=1+1;print(x)', options, function (err) {
//     if (err) throw err;
//     console.log('finished');
//   });

//   PythonShell.run('main.py', options, function (err) {
//     if (err) throw err;
//     console.log('finished');
//   });

const python = spawn("python", ["main.py"]);
var dataToSend;
python.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...');
    dataToSend = data.toString();
});
python.stderr.on("data", (data) => {
    console.log(data.toString());
});
// in close event we are sure that stream from child process is closed
python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    console.log(dataToSend)
});