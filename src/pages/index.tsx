import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { fetchHypercertBalance } from "../../graphql/queries";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import Navbar from "@/components/Navigation Bar/Navbar";
import { Button } from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between mt-[20px] mx-[30px]">
        <div>
          <h1 className="text-[30px]">🔥 ReIgnite</h1>
        </div>
        <div className="flex justify-center align-middle">
          <Navbar />
          <ConnectButton />
        </div>
      </div>
      <div className="flex flex-col justify-center align-middle text-[45px] mt-[300px] text-center">
        <h2 className="text-[4rem]">🔥</h2>
        <p>
          Welcome to ReIgnite — Fully on-chain retrospective public good funding
          application
        </p>
      </div>
      <div className="flex justify-center align-middle mt-[50px]">
        <Link href="/createGrant">
          <Button className="mr-[10px]">Get Started</Button>
        </Link>
        <Link href="/grants">
          <Button className="ml-[10px]">Explore</Button>
        </Link>
      </div>
    </div>
  );
}
