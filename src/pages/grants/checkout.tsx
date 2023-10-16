import Image from "next/image";
import { useGrantCartStore } from "../../../utils/store";
import { toast } from "react-hot-toast";
import React, { useMemo, useState } from "react";
import TrashIcon from "@/components/icons/Trash";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { FUNDING_POOL_CONTRACT, USDC_CONTRACT } from "../../../utils/constants";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import Link from "next/link";

export default function CheckoutGrants() {
  const { grants, updateCart, removeFromCart, clearCart } = useGrantCartStore();
  const router = useRouter();
  const totalAmount = useMemo(
    () => grants.reduce((prev, curr) => prev + curr.amount, 0),
    [grants]
  );

  const { address } = useAccount();

  const { data: allowance } = useContractRead({
    ...USDC_CONTRACT,
    functionName: "allowance",
    args: [address, FUNDING_POOL_CONTRACT.address],
  });

  const { data: decimals } = useContractRead({
    ...USDC_CONTRACT,
    functionName: "decimals",
  });

  const { config: donateConfig } = usePrepareContractWrite({
    ...FUNDING_POOL_CONTRACT,
    functionName: "depositFunds",
    args: [
      grants.map((grant) => BigNumber.from(grant.id.toString())),
      grants.map((grant) =>
        ethers.utils.parseUnits(
          grant.amount.toString(),
          BigNumber.from((decimals || 6).toString())
        )
      ),
      ethers.utils.parseUnits(
        totalAmount.toString(),
        BigNumber.from((decimals || 6).toString())
      ),
      USDC_CONTRACT.address,
    ],
  });

  const {
    data: donateData,
    write: donate,
    error,
  } = useContractWrite(donateConfig);

  const { config: allowanceConfig } = usePrepareContractWrite({
    ...USDC_CONTRACT,
    functionName: "approve",
    args: [
      FUNDING_POOL_CONTRACT.address,
      ethers.utils.parseUnits(
        `${totalAmount}`,
        BigNumber.from((decimals || 6).toString())
      ),
    ],
  });

  const { data: approveData, write: approve } =
    useContractWrite(allowanceConfig);

  const { isLoading: approving, isSuccess: approved } = useWaitForTransaction({
    hash: approveData?.hash,
  });

  const { isLoading: donating, isSuccess: donated } = useWaitForTransaction({
    hash: donateData?.hash,
  });

  const checkout = async () => {
    // First, we check if there is enough allowance
    if (
      allowance &&
      (allowance as BigNumber).gte(
        ethers.utils.parseUnits(
          totalAmount.toString(),
          BigNumber.from((decimals || 6).toString())
        )
      )
    ) {
      if (donate) {
        donate();
      }
    } else {
      if (approve) {
        approve();
      }
    }
  };

  React.useEffect(() => {
    if (approved) {
      if (donate) {
        donate();
      }
    }
  }, [approved]);

  React.useEffect(() => {
    if (donated) {
      clearCart();
      toast.success("Checkout success!");
      router.push("/grants");
    }
  }, [donated]);

  const updateValue = (id: number, amount: string) => {
    updateCart(id, Number(amount));
  };

  const removeGrantFromCart = (grantId: number) => {
    removeFromCart(grantId);
    toast.success("Grant removed from cart!");
  };

  return grants ? (
    <main className="flex min-h-screen flex-col items-start w-full px-8 py-24">
      <Link href="/grants">&lt; Back to grants</Link>
      <div className="flex min-h-screen flex-row items-start gap-6 w-full my-4">
        <div className="flex flex-col w-full gap-y-6 basis-[3/5]">
          {grants && grants.length > 0 ? (
            grants.map((grant) => (
              <div
                className="flex flex-row w-full items-center bg-slate-200 rounded-lg overflow-hidden text-black"
                key={grant.id}
              >
                <div className="flex aspect-square relative min-w-[128px] min-h-[128px] w-full">
                  <Image src={grant.image} alt="Random" fill />
                </div>
                <div className="flex flex-col w-full p-4 gap-y-2">
                  <p className="font-bold text-lg text-black">{grant.name}</p>
                  <p className="text-ellipsis overflow-hidden text-sm">
                    Token ID: {grant.id}
                  </p>
                </div>
                <div className="px-2 flex flex-row items-center gap-x-2">
                  <input
                    type="number"
                    className="min-w-[128px] w-full h-full p-2 rounded-lg"
                    onChange={(e) => updateValue(grant.id, e.target.value)}
                  />
                  <p>USDC</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeGrantFromCart(grant.id);
                  }}
                  className="mx-4 max-w-[24px] cursor-pointer"
                >
                  <TrashIcon className="fill-red-500 w-[24px]" />
                </button>
              </div>
            ))
          ) : (
            <p className="font-bold text-2xl">No grants in cart</p>
          )}
        </div>
        <div className="flex flex-col w-full basis-[2/5]">
          <div className="flex flex-col bg-slate-200 w-full rounded-lg p-6 text-black">
            <h1 className="font-bold my-6 text-2xl">Checkout Grants</h1>
            {grants.map((grant) => (
              <div
                className="flex flex-row w-full items-center justify-between"
                key={grant.id}
              >
                <p>{grant.name}</p>
                <p>{grant.amount} USDC</p>
              </div>
            ))}
            <hr className="border w-full my-4 border-black" />
            <div className="flex flex-row w-full items-center justify-between">
              <p>Total</p>
              <p>{totalAmount} USDC</p>
            </div>
            <button
              className="w-full rounded-full p-6 font-bold text-black bg-slate-400 my-4 disabled:opacity-50"
              disabled={totalAmount <= 0}
              onClick={checkout}
            >
              {allowance &&
              (allowance as BigNumber).gte(
                ethers.utils.parseUnits(
                  totalAmount.toString(),
                  BigNumber.from((decimals || 6).toString())
                )
              )
                ? "Checkout"
                : "Approve & Send"}
            </button>
          </div>
        </div>
      </div>
    </main>
  ) : (
    <></>
  );
}
