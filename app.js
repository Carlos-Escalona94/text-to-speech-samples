// const { SpeechToText } = require('./lib/tts/aws')
// const { SpeechToText } = require('./lib/tts/gcp')
const util = require('util')
const fs = require('fs')
const Stream = require('stream')
const SoxCommand = require('sox-audio')


const texts = ["Olá", "Carlos"]//["Olá, meu nome é", "Letícia.", "Eu posso ler qualquer texto que você digitar aqui. Pelo valor de", "5000", "reais"]

const run = async () => {
    try{

        // const p = new SpeechToText('./records', false, 0);

        // await p.run(texts);
        let audios= ['/c/Users/Carlos/Desktop/Repos/teste-text-to-speech/7eb48ad8-5122-46d6-9814-76a46a26b738.mp3']//, 'C:\\Users\\Carlos\\Desktop\\Repos\\teste-text-to-speech\\1833d856-785c-4242-b3b8-bf54b6a337bc.mp3']
        console.log(audios);
        var command = SoxCommand();

        for (const audio of audios) {
            command.input(audio)
        }

        command.output('./result.mp3').outputFileType('mp3').concat();

        command.on('prepare', function(args) {
            console.log('Preparing sox command with args ' + args.join(' '));
          });

        command.on('start', function(commandLine) {
            console.log('Spawned sox with command ' + commandLine);
        });
    
        command.on('progress', function(progress) {
            console.log('Processing progress: ', progress);
        });
    
        command.on('error', function(err, stdout, stderr) {
            console.log('Cannot process audio: ' + err.message);
            console.log('Sox Command Stdout: ', stdout);
            console.log('Sox Command Stderr: ', stderr)
        });
    
        command.on('end', function() {
            console.log('Sox command succeeded!');
        });

        // let promise = new Promise((resolve, reject) => {
        //     command.on('end', resolve);
        // })

        command.run();
        
    }catch(err){
        console.log(err);
    }
}

run().then().catch(e => console.log(e));