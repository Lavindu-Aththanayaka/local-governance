import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const pollAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const signerAddr = "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc";

    // ethers is automatically available in the global scope when running via 'hardhat run'
    // but importing it explicitly is safer.
    const poll = await ethers.getContractAt("OpinionPolling", pollAddr);

    // Call the mapping/function
    const isAuth = await poll.authorizedAuthorities(signerAddr);
    console.log(`Is authority authorized? ${isAuth}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});