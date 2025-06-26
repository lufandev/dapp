import { ethers } from "ethers";
import { messageBox } from "../service/message-service"
import { configuration } from '../config/blockChain'

    export const connectOnce = async () => {
        debugger;
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const network = await provider.getNetwork();
        const address = await signer.getAddress();
        return{chainId:network.chainId, address: address, provider, signer};
    }
    export const trying = async () => {
        const {chainId, address, provider, signer} = await connectOnce();
        const supported = configuration().chainId.toString();
        if (chainId.toString() == supported) {
            messageBox("success", "", 'chainId: ' + chainId + "      account: " + address.substring(0, 5) + "..")

            return {success:true, provider, signer};
        }
        messageBox("warning", "", 'chainId: ' + chainId + "      account: " + address.substring(0, 5) + "..")

        return {success:false};
    }
    export const connect = async () => {
        const {success} = await trying();
        if(success)
            return;
        const conf = configuration()
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: conf.params

        });
        await trying();

    }