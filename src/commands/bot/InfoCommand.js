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

export const DISCORD_INVITE_LINK = 'https://discord.gg/statusgame';
export const PRIVACY_POLICY = 'https://peach-darb-72.tiiny.site';

export const CLIENT_ID = '790967448111153153';
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

export const VERSION = await getPackageVersion();
export const COMMIT = await getGitCommit();

/**
 * Fetches the package version from `package.json`.
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

/**
 * Fetches the latest Git commit hash for version tracking.
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
            { name: 'Discord', url: DISCORD_INVITE_LINK, emoji: 'discord' }
        ];

        await interaction.reply({
            ephemeral: true,
            embeds: [new KeyValueEmbed()
                .setAuthor({name: 'Status Moderation Bot', iconURL: bot.client.user.displayAvatarURL()})
                .addLine(
                    'Status Moderation is a robust and feature-rich moderation bot created by bossmannn for the Status Discord server. It integrates the latest Discord features like slash-commands, context-menus, timeouts, buttons, select-menus, and modals to offer comprehensive moderation capabilities. These include:' 
                )
                .addLine(
                    '- **Automatic Filters**: Filters for bad words, phishing URLs, and other content through regex matching and custom detection patterns.'
                )
                .addLine(
                    '- **Moderation Tools**: Temporary bans, a flexible strike system, message logging, automated responses, and a variety of filters to maintain a safe community.'
                )
                .newLine()
                .addLine(
                    'For assistance or suggestions, you can reach out to bossmannn on Discord.'
                )
                .newLine()
                .addPairIf(VERSION, 'Version', VERSION)
                .addPairIf(COMMIT, 'Commit', hyperlink(COMMIT, `${GITHUB_REPOSITORY}/tree/${COMMIT}`, 'View on GitHub'))
                .addPair('Uptime', formatTime(process.uptime()))
                .addPair('Ping', bot.client.ws.ping + 'ms')
                .addLine('### Infrastructure & Specifications')
                .addLine(
                    'This bot is hosted on a high-performance server setup with:\n' +
                    '- **Processor**: 8-Core Intel Xeon processor\n' +
                    '- **Memory**: 16GB ECC RAM\n' +
                    '- **Storage**: 500GB NVMe SSD\n' +
                    '- **Operating System**: Ubuntu Server 20.04 LTS\n' +
                    'With automatic scaling based on server load, Status Moderation is optimized for high-availability and fast response times, ensuring smooth moderation for large and active servers.'
                )
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