/// <reference path="../types/ethereum.d.ts" />
import { ethers } from "ethers";
import { globalFeedback } from "@/components/ui/Feedback";
import { configuration } from '../config/blockChain'

    export const connectOnce = async () => {
        if (!window.ethereum) {
            globalFeedback.toast.error('钱包未安装', '请安装 MetaMask 或其他以太坊钱包');
            throw new Error('以太坊钱包未安装');
        }
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
            globalFeedback.toast.success(
                '连接成功', 
                `链ID: ${chainId} | 账户: ${address.substring(0, 5)}...`
            );
            return {success:true, provider, signer};
        }
        globalFeedback.toast.warning(
            '链ID不匹配', 
            `当前链ID: ${chainId} | 账户: ${address.substring(0, 5)}...`
        );
        return {success:false};
    }
    export const connect = async () => {
        const {success} = await trying();
        if(success)
            return;
        const conf = configuration()
        if (!window.ethereum) {
            globalFeedback.toast.error('钱包未安装', '请安装 MetaMask 或其他以太坊钱包');
            return;
        }
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: conf.params
        });
        await trying();

    }