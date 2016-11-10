/**
 * Created by julia on 07.11.2016.
 */
var Player = require('./player');
var ytdl = require('ytdl-core');
var winston = require('winston');
var EventEmitter = require('eventemitter3');
var SongImporter = require('./songImporter');
class VoiceManager extends EventEmitter {
    constructor(bot) {
        super();
        this.setMaxListeners(20);
        this.players = {};
    }

    join(msg, cb) {
        if (msg.guild) {
            if (!msg.guild.voiceConnection) {
                if (msg.member.voiceChannel) {
                    msg.member.voiceChannel.join().then((connection) => {
                        cb(null, connection);
                    }).catch(err => {
                        cb('joinVoice.error');
                    });
                } else {
                    cb('joinVoice.no-voice');
                }
            } else {
                cb(null, msg.guild.voiceConnection);
            }
        }
    }

    play(msg, immediate) {
        this.join(msg, (err, conn) => {
            if (err) return this.emit('error', err);
            let importer = new SongImporter(msg);
            importer.on('error', (err) => {
                this.emit('error', err);
            });
            importer.on('done', (Song) => {
                msg.channel.sendMessage(`Now Playing ${Song.title}`);
                this.players[msg.guild.id] = new Player(msg, conn, ytdl);
                this.players[msg.guild.id].play(Song,immediate);
            });
        });
    }

    pause(msg) {
        try {
            this.players[msg.guild.id].pause();
            this.emit('success');
        } catch (e) {
            this.emit('error');
        }
    }

    resume(msg) {
        try {
            this.players[msg.guild.id].resume();
            this.emit('success');
        } catch (e) {
            this.emit('error');
        }
    }

    addToQueue(msg) {
        this.join(msg, (err, conn) => {
            if (err) return this.emit('error', err);
            let importer = new SongImporter(msg);
            importer.on('error', (err) => {
                this.emit('error', err);
            });
            importer.on('done', (Song) => {
                msg.channel.sendMessage(`Queued ${Song.title}`);
                if (typeof (this.players[msg.guild.id]) !== 'undefined') {
                    this.players[msg.guild.id].addToQueue(Song);
                } else {
                    this.players[msg.guild.id] = new Player(msg, conn, ytdl);
                    this.players[msg.guild.id].addToQueue(Song);
                }
            });
        });
    }

    getQueue(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined' && this.players[msg.guild.id].queue.songs.length > 0) {
            this.emit('queue', this.players[msg.guild.id].queue);
        } else {
            this.emit('error', 'generic.no-song-in-queue');
        }
    }

    forceSkip(msg) {
        if (typeof (this.players[msg.guild.id]) !== 'undefined') {
            this.players[msg.guild.id].nextSong();
        }
    }
}
var manager = new VoiceManager();
module.exports = manager;