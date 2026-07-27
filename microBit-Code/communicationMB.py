radioChannel = 1

# Imports go at the top
from microbit import *
import radio

uart.init()


known_microbits = []  # list of active micro:bits
generated_images = []  # Images created by students, packed images
# constructingImage = [[False, ""], [False, ""], [False, ""], [False, ""], [False, ""]]
display.show(Image.SQUARE_SMALL)
message_under_construction = False
sender_name = ""
recipient_name = ""
message_complete = False
uart_over = False
send_on_permitted = False
encryptable = False
auto_encryptable = False
allow_recipient = False
should_beep = False
encryption_code = ""
receive_from_known = []
packed_image = ""

###################################################
## Setup for the radio:
###################################################
radio.config(
    group=radioChannel, power=7, data_rate=radio.RATE_1MBIT, queue=10, channel=42
)
radio.on()
radiostart = False

###################################################
## Assisting functions
###################################################


# Function to produce the correct message format for the computer
def write_to_computer(message_to_write):
    """Write a message to the computer in a format that can be parsed."""
    print("#" + str(message_to_write) + "&")


def broadcast_settings():
    """Broadcast the current settings to all known micro:bits."""
    # settings_| isEncryptable |_| autoEncrypt |_| allowRecipient |_| shouldBeep |
    send_radio_message(
        "settings_"
        + ("1" if encryptable else "0")
        + "_"
        + ("1" if auto_encryptable else "0")
        + "_"
        + ("1" if allow_recipient else "0")
        + "_"
        + ("1" if should_beep else "0")
    )


def pack_image(matrix):
    """Converts a 5x5 matrix into a 5-char alphanumeric string (A-Z, 0-5)."""
    return "".join(
        chr(v + 65) if v <= 25 else str(v - 26)
        for v in (int("".join(map(str, row)), 2) for row in matrix)
    )


def unpack_image(payload):
    """Converts a 5-char alphanumeric string back into a 5x5 matrix."""
    return [
        [
            int(bit)
            for bit in "{:05b}".format(int(c) + 26 if c.isdigit() else ord(c) - 65)
        ]
        for c in payload
    ]


def send_radio_message(message_to_send):
    """Sends a message over the radio and logs it."""
    log("sm_" + message_to_send)  # sm: send message
    radio.send(message_to_send)


def log(message_to_log):
    """Logs a message to the computer for debugging purposes."""
    write_to_computer("debug_" + message_to_log)  # debug: log message


write_to_computer("lc")  # Lost connection
###################################################
## Loop
###################################################
while True:
    # Listen for input from computer before listening for radio input
    if uart.any():
        sleep(300)  # Give time for the full message to be received
        uartmessage = str(uart.readline())
        if "start" in uartmessage:
            display.show(Image.SQUARE)
            radiostart = True

    while radiostart:
        # Listen for serial input
        if uart.any():
            sleep(300)  # Give time for the full message to be received
            uartmessage = str(uart.readline())
            if "echo" in uartmessage:  # Echo the message back to the computer
                write_to_computer("echo_" + uartmessage.split("_")[3])
            if "count" in uartmessage:  # Get update on number of known micro:bits by the computer
                for i, known in enumerate(known_microbits):
                    write_to_computer("nu_" + str(i) + "_" + str(known).split("'")[1])
            if "nmComp" in uartmessage:  # If all of the message has been received
                uart_over = True
            if "sendMessage" in uartmessage:
                sender_name = uartmessage.split("_")[3]
                recipient_name = uartmessage.split("_")[4]
                packed_image = uartmessage.split("_")[5]
                send_on_permitted = True
                uart_over = True
            if "newImg" in uartmessage:
                image_index = len(generated_images)
                packed_image = uartmessage.split("_")[3]
                generated_images.append(packed_image)

                send_radio_message("newImg_" + str(image_index) + "_" + packed_image)
            if "known" in uartmessage:
                known_microbits.append([uartmessage.split("_")[3]])
            if "knownImg" in uartmessage:
                image_index = len(generated_images)
                generated_images.append(uartmessage.split("_")[3])
            if "settings" in uartmessage:
                encryptable = uartmessage.split("_")[3] == "1"
                auto_encryptable = uartmessage.split("_")[4] == "1"
                allow_recipient = uartmessage.split("_")[5] == "1"
                should_beep = uartmessage.split("_")[6] == "1"
                broadcast_settings()

            if "forgetAll" in uartmessage:
                known_microbits = []
                generated_images = []
                send_radio_message("reintroduce")
                write_to_computer("mbc_0")  # mbc: micro:bit count

        # Listen for radio input
        message = radio.receive()
        if message:
            log("rm_" + message)  # rm: received message

            if "hello" in message:
                microbit_id = str(message.split("_")[0])  # get the id of the microbit
                # Check if microbit is already known by system
                microbit_index = 0
                microbit_unknown = True
                for i, microbit in enumerate(known_microbits):
                    if microbit[0] == microbit_id:  # If known, update the value locally
                        microbit_index = i
                        microbit_unknown = False
                        send_radio_message(
                            str(microbit_id)
                            + "_number_"
                            + str(microbit_index)
                            + "_"
                            + str(len(known_microbits))
                        )

                if microbit_unknown:  # If this is a new microbit
                    microbit_index = len(known_microbits)
                    known_microbits.append(
                        [microbit_id]
                    )  # We add the microbit information locally
                    # Finally, we update the computer with any new information
                    write_to_computer(
                        "nu_" + str(microbit_index) + "_" + microbit_id
                    )  # nu: new user
                    write_to_computer(
                        "mbc_" + str(len(known_microbits))
                    )  # mbc: micro:bit count
                    send_radio_message(
                        str(microbit_id)
                        + "_number_"
                        + str(microbit_index)
                        + "_"
                        + str(len(known_microbits))
                    )
                    send_radio_message("known_" + str(len(known_microbits)))

                for i, generatedImage in enumerate(generated_images):
                    send_radio_message("newImg_" + str(i) + "_" + generatedImage)

                broadcast_settings()

            if "send" in message:
                messageComponents = message.split("_")

                # [0] = id; [1] = message code; [2] = recipient id; [3] = packed image index; [4] = code

                sender_id = str(messageComponents[0])
                sender_name = sender_id
                recipient_id = int(messageComponents[2])
                recipient_name = (
                    str(known_microbits[recipient_id]).split("'")[1]
                    if recipient_id != -1
                    else "ALL"
                )
                packed_image = str(messageComponents[3])
                receivedImage = unpack_image(str(messageComponents[3]))

                display.show("!")
                sleep(200)
                display.clear()

                if encryptable:
                    encryption_code = messageComponents[4]

                write_to_computer(
                    "nm_"
                    + sender_id
                    + "_"
                    + str(recipient_name)
                    + "_"
                    + packed_image
                    + ("_" + encryption_code if encryptable else "")
                )  # nm: new message
                write_to_computer("mbc_" + str(len(known_microbits)))
            if "complete" in message:
                sender_id = str(message.split("_")[0])
                all_received = False
                if not allow_recipient:
                    for i, receiveEntry in enumerate(receive_from_known):
                        if sender_id == receiveEntry[0]:
                            receive_from_known[i][1] = True

                    all_received = True

                    for i, receiveEntry in enumerate(receive_from_known):
                        if not receiveEntry[1]:
                            all_received = False

                if sender_id == recipient_name or all_received:
                    sender_name = ""
                    recipient_name = ""
                    message_complete = False
                    message_under_construction = False
                    send_on_permitted = False
                uart_over = False

        if send_on_permitted:
            sender_number = 0
            for i, microbit in enumerate(known_microbits):
                if microbit[0] == sender_name:
                    sender_number = i

            send_radio_message(
                str(recipient_name)
                + "_receive_"
                + packed_image
                + "_"
                + str(sender_number)
                + ("_" + encryption_code if encryptable else "")
            )
            send_on_permitted = False
