import { MessageHandler, RmqOptions, ServerRMQ } from "@nestjs/microservices";

interface MassTransitEnvelope<TPayload> {
    messageType: string[];
    message: any;
}


export class MassTransitServer extends ServerRMQ {
    constructor(options: Required<RmqOptions>['options']) {
        super(options);
    }

    public async handleMessage(
        originalMessage: any,
        channel: any,
    ): Promise<void> {
        try {
            const messageAsString = originalMessage.content.toString();
            const messageEnvelope = JSON.parse(messageAsString);

            const messageType = messageEnvelope.messageType[0];

            const pattern = messageType.split("+").pop();

            if (!pattern) {
                channel.ack(originalMessage, false, false);
            }

            const data = messageEnvelope.message;

            const nestJsMessage = {
                pattern: pattern,
                data: data
            };

            const newContent = Buffer.from(JSON.stringify(nestJsMessage));
            const modifiedMessage = { ...originalMessage, content: newContent };
            await super.handleMessage(modifiedMessage, channel);


        } catch (error) {
            channel.nack(originalMessage, false, false);
        }
    }
}