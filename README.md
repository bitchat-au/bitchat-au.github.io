# Bit:Chat

Bit:Chat is a research project developed by Aarhus University to help children in Danish schools understand how digital communication works in practice. The project is built around a simple tangible exercise: two or more micro:bits are used to simulate messaging systems similar to those used in social media apps such as Facebook, Snapchat, or Instagram.

One micro:bit acts as a server and is plugged into a computer with the accompanying website open, while the other micro:bits act as clients. The clients can send messages back and forth, making it possible to visualize how messages travel from a sender, through a server, and back to a receiver.

When using the tool, different features can be enabled or disabled, to teach specifically about any of the available concepts. All features can be enabled/disabled independently of each other, allowing for greater flexability.

## What the project teaches

Bit:Chat is designed to help children understand that everything they send online passes through a central server, where it may be stored, logged, inspected, or modified. The tool makes it concrete that messages are not magically private just because they are sent between two users: in practice, platforms and services can see and handle the data on their servers.

The project encourages students to reflect on privacy, digital traces, and the idea that a server can reroute or alter messages in ways that are not always visible to the users. It supports discussion of how online communication systems work and why data security matters.

Bit:Chat also includes an encryption mode. In this mode, each client micro:bit can encrypt their message with a small key before sending it to the server, so the server cannot easily read the message content without the key. This gives students a concrete, hands-on way to explore how cryptography can protect information.

In addition, the project includes an exercise where students try to break encryption on random images. This makes the idea of code-breaking and message security more tangible and helps connect the concept of encryption to real-world challenges.

## Flashing

There are three main ways of flashing the micro:bits

- **Manually flashing:** the code for both the communication and dummy micro:bits can be located in `src/micropython`, and can be manually flashed using tools such as <https://python.microbit.org/>
- **Group flasher:** the website contains a built in tool for flashing a set of dummy microbits, and a single communication microbit. The tool is designed to be used by students, allowing them to flash the micro:bits they will be using in their group. The tool can be found at <https://bitchat-au.github.io/flash>
- **Bulk flasher:** The last way of flashing is the bulk/classroom flasher, designed to quickly flash multiple sets of micro:bits. *!! This tool is the most advanced, and requires manually configuring chrome to allow for unrestricted access to WebUSB, drastically reducing the time and steps it takes to flash the micro:bits. !!* This tool can be found at <https://bitchat-au.github.io/classroom-flasher>

## Code overview

This repository combines a browser app with the MicroPython logic used by the micro:bits.

```text
bitchat/
├── public/
├── src/
│   ├── helpers/                    
│   ├── i18n/
│   │   ├── da.json
│   │   └── en.json
│   ├── lib/
│   │   ├── Components/
│   │   ├── Dialogs/
│   │   ├── Layouts/
│   │   └── Pages/
│   ├── micropython/                  # Micropython code and micropython base code
│   │   ├── communicationMB.py
│   │   └── dummy.py
│   ├── services/
│   └── styles/
```

The overall goal is to combine a browser-based teaching interface with micro:bit hardware to make abstract concepts about networking, privacy, servers, and encryption understandable and engaging for children.
