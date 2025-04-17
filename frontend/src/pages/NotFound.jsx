import React from "react";
import FuzzyText from "../components/FuzzyText/FuzzyText";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@heroui/react";

export default function NotFound() {
  return (
    <div>
      <div className="flex w-screen h-screen justify-center items-center">
        <Card className="w-screen h-screen">
          <div className="flex-[2_2_0%] justify-center items-center flex-col text-center h-full">
            <CardHeader className="flex-[2_2_0%] justify-center items-center">
              <FuzzyText
                color="initial"
                baseIntensity={0.2}
                hoverIntensity={0.6}
              >
                404
              </FuzzyText>
            </CardHeader>
            <CardBody className="flex-[2_2_0%] justify-center items-center">
              <FuzzyText
                color="initial"
                baseIntensity={0.2}
                hoverIntensity={0.6}
                fontSize={30}
              >
                Page not found
              </FuzzyText>
            </CardBody>
          </div>
        </Card>
      </div>
    </div>
  );
}
