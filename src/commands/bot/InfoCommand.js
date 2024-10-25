import Command from '../Command.js';
import {
    ActionRowBuilder,
    ButtonStyle, hyperlink,
    PermissionFlagsBits,
    PermissionsBitField
} from 'discord.js';
import bot from '../../bot/Bot.js';
import KeyValueEmbed from '../../embeds/KeyValueEmbed.js';
import {formatTime} from '../../util/timeutils.js';
import {readFile} from 'fs/promises';
import {exec} from 'child_process';
import {promisify} from 'util';
import {componentEmojiIfExists} from '../../util/format.js';
import BetterButtonBuilder from '../../embeds/BetterButtonBuilder.js';

export const GITHUB_REPOSITORY = 'https://github.com/aternosorg/modbot';
export const DISCORD_INVITE_LINK = 'https://discord.gg/statusgame';
export const PRIVACY_POLICY = 'https://peach-darb-72.tiiny.site';

export const CLIENT_ID = '1299263536740044821';
export const SCOPES = ['bot', 'applications.commands'];
export const PERMISSIONS = new PermissionsBitField()
    .add(PermissionFlagsBits.ViewChannel)
    .add(PermissionFlagsBits.ManageChannels)
    .add(PermissionFlagsBits.ManageRoles)
    .add(PermissionFlagsBits.KickMembers)
    .add(PermissionFlagsBits.BanMembers)
    .add(PermissionFlagsBits.ModerateMembers)
    .add(PermissionFlagsBits.ManageMessages)
    .add(PermissionFlagsBits.SendMessages)
    .add(PermissionFlagsBits.ViewAuditLog);
export const INVITE_LINK = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=${SCOPES.join('%20')}&permissions=${PERMISSIONS.bitfield}`;

export const VERSION = await getPackageVersion();
/**
 * @returns {Promise<?string>}
 */
async function getPackageVersion() {
    try {
        const pkgJson = JSON.parse((await readFile('package.json')).toString());
        if (pkgJson?.version) {
            return pkgJson.version;
        }
    } catch {/* ignored */}
    return null;
}

export const COMMIT = await getGitCommit();

/**
 * @returns {Promise<?string>}
 */
async function getGitCommit() {
    if (process.env.MODBOT_COMMIT_HASH) {
        return /** @type {string} */ process.env.MODBOT_COMMIT_HASH;
    }

    try {
        return (await promisify(exec)('git rev-parse --short HEAD'))?.stdout?.replaceAll?.('\n', '');
    } catch {
        return null;
    }
}

export default class InfoCommand extends Command {

    isAvailableInDMs() {
        return true;
    }

    async execute(interaction) {
        const buttons = [
            { name: 'Privacy', url: PRIVACY_POLICY, emoji: 'privacy' },
            { name: 'Discord', url: DISCORD_INVITE_LINK, emoji: 'discord' },
        ];

        await interaction.reply({
            ephemeral: true,
            embeds: [new KeyValueEmbed()
                .setAuthor({name: 'Status Moderation Bot', iconURL: bot.client.user.displayAvatarURL()})
                .addLine(
                    'Status Moderation is a powerful moderation bot developed by bossmannn specifically for the Status Discord server. ' +
                    'Utilizing the latest in Discord API features such as slash-commands, context-menus, timeouts, buttons, select-menus, and modals, ' +
                    'it offers extensive moderation capabilities. These include automatic word filtering, phishing URL detection, temporary bans, ' +
                    'a configurable strike system, message logging, and response automation with regex support.'
                )
                .newLine()
                .addLine(
                    'This bot is supported on a robust infrastructure featuring:\n' +
                    '- **Processor**: 8-Core Intel Xeon\n' +
                    '- **Memory**: 16GB ECC RAM\n' +
                    '- **Storage**: 500GB NVMe SSD\n' +
                    '- **Operating System**: Ubuntu Server 20.04 LTS\n' +
                    'Additionally, the system is configured for automatic scaling and optimized for high availability, ensuring reliable performance for active and large servers.'
                )
                .newLine()
                .addLine(
                    `For suggestions or assistance, reach out to bossmannn on Discord, or join the [Discord server](${DISCORD_INVITE_LINK}).`
                )
                .newLine()
                .addPairIf(VERSION, 'Version', VERSION)
                .addPairIf(COMMIT, 'Commit', hyperlink(COMMIT, `${GITHUB_REPOSITORY}/tree/${COMMIT}`, 'View on GitHub'))
                .addPair('Uptime', formatTime(process.uptime()))
                .addPair('Ping', bot.client.ws.ping + 'ms')
            ],
            components: [
                /** @type {ActionRowBuilder} */
                new ActionRowBuilder()
                    .addComponents(
                        /** @type {*} */ buttons.map(data =>
                            new BetterButtonBuilder()
                                .setLabel(data.name)
                                .setStyle(ButtonStyle.Link)
                                .setURL(data.url)
                                .setEmojiIfPresent(componentEmojiIfExists(data.emoji, null)))
                    )
            ]
        });
    }

    getDescription() {
        return 'Show general information about Status Moderation Bot';
    }

    getName() {
        return 'info';
    }
}
