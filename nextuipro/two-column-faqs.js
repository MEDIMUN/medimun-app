"use client";

import React from "react";
import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Autocomplete, AutocompleteSection, AutocompleteItem } from "@nextui-org/autocomplete";
import { Badge } from "@nextui-org/badge";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";
import { Chip } from "@nextui-org/chip";
import { CircularProgress } from "@nextui-org/progress";
import { Code } from "@nextui-org/code";
import { Divider } from "@nextui-org/divider";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from "@nextui-org/dropdown";
import { Input } from "@nextui-org/input";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Listbox, ListboxSection, ListboxItem } from "@nextui-org/listbox";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@nextui-org/navbar";
import { Pagination, PaginationItem, PaginationCursor } from "@nextui-org/pagination";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Progress } from "@nextui-org/progress";
import { RadioGroup, Radio } from "@nextui-org/radio";
import { Select, SelectSection, SelectItem } from "@nextui-org/select";
import { Skeleton } from "@nextui-org/skeleton";
import { Snippet } from "@nextui-org/snippet";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Spacer } from "@nextui-org/spacer";
import { Spinner } from "@nextui-org/spinner";
import { Switch } from "@nextui-org/switch";
import { Slider } from "@nextui-org/slider";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Textarea } from "@nextui-org/input";
import { Tooltip } from "@nextui-org/tooltip";
import { User } from "@nextui-org/user"; import { Icon } from "@iconify/react";


export default function TwoColumnFaqs ( { faqs } ) {
   return (
      <section className="mx-auto w-full max-w-6xl py-20 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
         <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12">
            <h2 className="px-2 text-3xl leading-7">
               <span className="inline-block lg:hidden">FAQs</span>
               <p className="hidden bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text pt-4 text-5xl font-semibold tracking-tight text-transparent dark:to-foreground-200 lg:inline-block">
                  Frequently
                  <br />
                  asked
                  <br />
                  questions
               </p>
            </h2>
            <Accordion
               fullWidth
               keepContentMounted
               className="gap-3"
               itemClasses={ {
                  base: "px-0 sm:px-6",
                  title: "font-medium",
                  trigger: "py-6 flex-row-reverse",
                  content: "pt-0 pb-6 text-base text-default-500"
               } }
               items={ faqs }
               selectionMode="multiple">

               { faqs.map( ( item, i ) =>
                  <AccordionItem
                     key={ i }
                     indicator={ <Icon icon="lucide:plus" width={ 24 } /> }
                     title={ item.title }>

                     { item.content }
                  </AccordionItem>
               ) }
            </Accordion>
         </div>
      </section> );

}