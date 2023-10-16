import { useGrantCartStore } from "../../../utils/store";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import Link from "next/link";
import { paginatedIndexesConfig, useContractInfiniteReads } from "wagmi";
import { useEffect, useState } from "react";
import { fetchData } from "@/services/uploadMeta";
import { HYPERCERT_CONTRACT } from "../../../utils/constants";
import Timer from "@/components/timer/Timer";
import {
  Card,
  Image,
  CardBody,
  Stack,
  Heading,
  Divider,
  CardFooter,
  ButtonGroup,
  Button,
  Text,
} from "@chakra-ui/react";

interface Grant {
  id: number;
  name: string;
  description: string;
  image: string;
}

export default function Grants() {
  const {
    addToCart,
    removeFromCart,
    grants: selectedGrants,
  } = useGrantCartStore();
  const [grants, setGrants] = useState<any>();
  const ITEMS_PER_PAGE = 12;

  const { data: grantsData, fetchNextPage } = useContractInfiniteReads({
    cacheKey: "grants-data-3",
    ...paginatedIndexesConfig(
      (index) => {
        return [
          {
            ...HYPERCERT_CONTRACT,
            functionName: "uri",
            args: [index] as const,
          },
        ];
      },
      { start: 0, perPage: ITEMS_PER_PAGE, direction: "increment" }
    ),
  });

  const addGrantToCart = (grant: Grant) => {
    addToCart(grant);
    toast.success("Grant added to cart!");
  };

  const removeGrantFromCart = (grantId: number) => {
    removeFromCart(grantId);
    toast.success("Grant removed from cart!");
  };

  useEffect(() => {
    const getGrantsInfo = async () => {
      const grants = [];
      let index = 0;
      for await (const page of grantsData!.pages) {
        for await (const grantHash of page) {
          if (grantHash) {
            const data = await fetchData(grantHash as string);

            grants.push({
              id: index,
              name: data.title,
              description: data.description || "Donate to this grant!",
              image: data.image || `https://picsum.photos/id/${index}/512/512`,
            });
            index++;
          }
        }
      }

      setGrants(grants);
    };

    if (grantsData && grantsData.pages) {
      getGrantsInfo();
    }
  }, [grantsData, grantsData?.pages]);

  return (
    <main className={`flex min-h-screen flex-col items-center pt-8 px-24 pb-8`}>
      <nav className="w-full mb-8 flex flex-row items-center justify-between">
        <Link href="/">
          <p className="font-bold text-xl">ReIgnite 🔥</p>
        </Link>
      </nav>
      <div className="flex flex-col items-center justify-center">
        <h1 className="font-bold my-6 text-2xl">Grants</h1>
        <div className="grid grid-cols-3 items-center justify-center w-full gap-6 lg:gap-x-12">
          {grants &&
            grants.map((grant: any) => {
              const selected = selectedGrants.some(
                (obj) => obj.id === grant.id
              );
              console.log({ grant });
              return (
                <Card
                  minW="xs"
                  key={grant.id}
                  onClick={() =>
                    selected
                      ? removeGrantFromCart(grant.id)
                      : addGrantToCart(grant)
                  }
                  className={clsx(
                    selected ? "border-4 border-teal-500" : "",
                    "cursor-pointer rounded-lg"
                  )}
                >
                  <CardBody
                    className={clsx(
                      selected ? "border-4 border-emerald-400" : "",
                      "rounded-lg"
                    )}
                  >
                    <Image
                      src={grant.image}
                      alt="grant"
                      borderRadius="lg"
                      className="w-full h-full"
                    />
                    <Stack mt="6" spacing="3">
                      <Heading size="md">{grant.name}</Heading>
                      <Text>{grant.description}</Text>
                    </Stack>
                  </CardBody>
                  <Divider />
                  <CardFooter className="flex-col">
                    <p className="text-ellipsis overflow-hidden text-sm">
                      Token ID: {grant.id}
                    </p>
                  </CardFooter>
                </Card>
              );
            })}
        </div>
        <Link
          className="w-full items-center justify-center flex font-bold text-lg p-4 bg-slate-400 rounded-full max-w-xs my-8 relative"
          href="/grants/checkout"
        >
          Checkout
          <span className="w-4 h-4 p-4 flex items-center justify-center bg-emerald-500 rounded-full absolute -top-4 right-0 text-white">
            {selectedGrants.length}
          </span>
        </Link>
      </div>
    </main>
  );
}
