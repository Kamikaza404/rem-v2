/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../Objects/command');
// let MessageCollector = require('discord.js').MessageCollector;
let PermManager = require('../modules/permissionManager');
let winston = require('winston');
class Help extends Command {
    constructor(t) {
        super();
        this.cmd = "help";
        this.cat = "generic";
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
        this.categories = [];
        this.categories_name = [];
        this.msg = null;
        this.p = new PermManager();
    }

    run(msg) {
        this.categories = [];
        this.categories_name = [];
        let msgSplit = msg.content.split(' ').splice(1);
        if (this.categories.length < 1) {
            this.buildHelp(msg);
        }
        this.msg = msg;
        if (msg.guild) {
            msg.channel.createMessage(`${msg.author.mention}, ${this.t('help.helpReply', {
                lngs: msg.lang,
                pre: msg.prefix
            })}`);
        }
        if (msgSplit.length > 0) {
            return this.exactHelp(msg, msgSplit);
        }
        msg.author.getDMChannel().then(channel => {
            channel.createMessage({
                embed: {
                    author: {name: "Command categories"},
                    footer: {text: "Type !w.help number to get the commands of a category"},
                    fields: this.categories_name,
                    color: 0x00ADFF
                }
            }).then(msg => {

            });
        }).catch(e => winston.error);
    }

    buildHelp(msg) {
        let commands = msg.cmds;
        let i = 1;
        for (let command in commands) {
            if (commands.hasOwnProperty(command)) {
                let cmd = commands[command];
                if (typeof (cmd.hidden) !== 'undefined') {

                } else if (this.checkCat(cmd.cat, this.categories)) {
                    this.categories = this.pushCat(cmd, this.categories);
                } else {
                    this.categories.push({name: cmd.cat, commands: [cmd]});
                    this.categories_name.push({name: i, value: cmd.cat, inline: true});
                    i += 1;
                }
            }
        }
    }

    exactHelp(msg, msgSplit) {
        let number = 0;
        try {
            number = parseInt(msgSplit[0]);
        } catch (e) {

        }
        if (isNaN(number) || number < 1) {
            let cat = this.checkCat(msgSplit[0], this.categories);
            if (cat) {
                this.sendReply(msg, cat);
            } else {
                msg.author.getDMChannel().then(channel => {
                    channel.createMessage(this.t('generic.cat-nope', {lngs: msg.lang}));
                }).catch(e => winston.error);
            }
        }
        if (number < 1) {
            msg.author.getDMChannel().then(channel => {
                return channel.createMessage(this.t('generic.negative', {number: number}));
            }).catch(e => winston.error);
        }
        if (!isNaN(number) && number <= this.categories.length) {
            this.sendReply(msg, this.categories[number - 1])
        }
    }

    startCollector(origMsg) {
        // let collector = new MessageCollector(origMsg.channel, (msg, coll) => {
        //     if (msg.author.id === this.msg.author.id) {
        //         return true
        //     }
        // }, {time: 1000 * 30});
        // collector.on('message', (msg) => {
        //     let number = 0;
        //     try {
        //         number = parseInt(msg.content);
        //     } catch (e) {
        //         return msg.channel.createMessage(this.t('generic.whole-num'));
        //     }
        //     if (isNaN(number)) {
        //         return msg.channel.createMessage(this.t('generic.nan'));
        //     }
        //     if (number < 1) {
        //         return msg.channel.createMessage(this.t('generic.negative', {number: number}));
        //     }
        //     if (msg.content.startsWith(msg.prefix)) {
        //         collector.stop();
        //     }
        //     if (msg.content === 'c') {
        //         collector.stop();
        //     }
        //     if (!isNaN(number) && number <= this.categories.length) {
        //         collector.stop();
        //         this.sendReply(msg, this.categories[number - 1])
        //     }
        // });
    }

    sendReply(msg, data) {
        let fields = [];
        for (let i = 0; i < data.commands.length; ++i) {
            fields.push({
                name: `${this.msg.prefix}${data.commands[i].cmd}`,
                value: `${this.t(`help.${data.commands[i].cmd}`, {
                    lngs: this.msg.lang,
                    languages: this.buildLang(this.msg.lngs)
                })}`,
                inline: true
            });
        }
        let reply = {
            embed: {
                author: {name: `${this.t(`help.${data.name}`, {lngs: this.msg.lang})}`},
                fields: fields,
                color: 0x00ADFF
            }
        };
        msg.author.getDMChannel().then(channel => {
            channel.createMessage(reply).then(msg => {

            });
        }).catch(e => winston.error);

    }

    buildLang(list) {
        let i = list.length;
        let answer = "";
        while (i--) {
            if (list[i] !== 'dev') {
                answer = answer + `${list[i]} | `;
            }
        }
        return answer;
    }

    checkCat(cat, list) {
        let i = list.length;
        while (i--) {
            if (cat === list[i].name) {
                return list[i];
            }
        }
        return false;
    }

    pushCat(cmd, list) {
        let i = list.length;
        while (i--) {
            if (cmd.cat === list[i].name) {
                list[i].commands.push(cmd);
            }
        }
        return list;
    }
}
module.exports = Help;