/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../Objects/command');
class Dere extends Command {
    constructor(t) {
        super();
        this.cmd = "dere";
        this.cat = "misc";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.deres = [
            "dandere",
            "deredere",
            "himedere",
            "kamidere",
            "kuudere",
            "mayadere",
            "yandere",
            "oujidere",
            "tsundere",
            "undere",
            "yangire"
        ]
    }

    run(msg) {
        let msgSplit = msg.content.split(' ').splice(1);
        if (msgSplit.length > 0) {
            let dere = this.matchDere(msgSplit);
            if (dere) {
                msg.channel.createMessage('```' + this.t(`dere.${dere}`, {lngs: msg.lang}) + '```');
            } else {
                msg.channel.createMessage(this.t('dere.no-dere', {lngs: msg.lang}) + '```');
            }
        } else {
            let random = Math.floor(Math.random() * (this.deres.length - 1));
            try {
                msg.channel.createMessage('```' + this.t(`dere.${this.deres[random - 1]}`, {lngs: msg.lang}) + '```');
            } catch (e) {
                msg.channel.createMessage('```' + this.t(`dere.${this.deres[0]}`, {lngs: msg.lang}) + '```');
            }
        }
    }

    matchDere(msgSplit) {
        for (let i = 0; i < this.deres.length; i++) {
            if (msgSplit[0].toLowerCase() === this.deres[i]) {
                return this.deres[i];
            }
        }
        return false;
    }
}
module.exports = Dere;