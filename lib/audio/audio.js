const fs = require('fs')
const Stream = require('stream')
const SoxCommand = require('sox-audio')

class AudioTools{

    async concatenate(output, audios){
        console.log(audios);
        let command = new SoxCommand();

        for (const audio of audios) {
            command.input(audio)
        }

        command.output(output).outputFileType('mp3').concat();

        command.on('error', function(err, stdout, stderr) {
            console.log('Cannot process audio: ' + err.message);
            console.log('Sox Command Stdout: ', stdout);
            console.log('Sox Command Stderr: ', stderr)
        });

        let promise = new Promise((resolve, reject) => {
            command.on('end', resolve);
        })

        command.run();

        return promise;
    }
}

module.exports = { AudioTools }